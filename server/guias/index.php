<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$usuario = require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

function formatar_guia(array $g): array {
    return [
        'id' => $g['codigo'],
        'obitoId' => $g['obito_codigo'],
        'clienteNome' => $g['cliente_nome_snapshot'],
        'clienteVinculo' => $g['cliente_vinculo_snapshot'],
        'parceiroId' => $g['parceiro_codigo'],
        'servico' => $g['servico'],
        'valorAcordado' => (float) $g['valor_acordado'],
        'emitidaEm' => $g['emitida_em'],
        'emitidaPor' => $g['emitida_por_nome'],
        'status' => $g['status'],
        'coberto' => (bool) $g['coberto'],
        'canceladaJustificativa' => $g['cancelada_justificativa'],
        'pdfNumero' => str_replace('GA-', '', $g['codigo']),
    ];
}

if ($method === 'GET') {
    $sql = 'SELECT g.*, ob.codigo AS obito_codigo, pa.codigo AS parceiro_codigo, u.nome AS emitida_por_nome
            FROM guias g
            LEFT JOIN obitos ob ON ob.id = g.obito_id
            JOIN parceiros pa ON pa.id = g.parceiro_id
            LEFT JOIN usuarios u ON u.id = g.emitida_por_usuario_id
            WHERE 1=1';
    $params = [];
    if (!empty($_GET['parceiroId'])) { $sql .= ' AND pa.codigo = ?'; $params[] = $_GET['parceiroId']; }
    if (!empty($_GET['obitoId'])) { $sql .= ' AND ob.codigo = ?'; $params[] = $_GET['obitoId']; }
    $sql .= ' ORDER BY g.id DESC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    json_response(array_map('formatar_guia', $stmt->fetchAll()));
}

if ($method === 'POST') {
    $body = read_json_body();
    $contratoCodigo = $body['contratoId'] ?? '';
    $parceiroCodigo = $body['parceiroId'] ?? '';
    $clienteNome = trim($body['clienteNome'] ?? '');
    $clienteVinculo = $body['clienteVinculo'] ?? '';
    $servico = trim($body['servico'] ?? '');
    $valorAcordado = isset($body['valorAcordado']) ? (float) $body['valorAcordado'] : 0;

    if ($contratoCodigo === '' || $parceiroCodigo === '' || $clienteNome === '' || $servico === '') {
        json_error('Contrato, parceiro, beneficiário e serviço são obrigatórios.', 400);
    }

    $contrato = $pdo->prepare('SELECT id, cliente_id FROM contratos WHERE codigo = ?');
    $contrato->execute([$contratoCodigo]);
    $contratoRow = $contrato->fetch();
    if (!$contratoRow) json_error('Contrato não encontrado.', 404);

    $parceiro = $pdo->prepare('SELECT id FROM parceiros WHERE codigo = ?');
    $parceiro->execute([$parceiroCodigo]);
    $parceiroId = $parceiro->fetchColumn();
    if (!$parceiroId) json_error('Parceiro não encontrado.', 404);

    $obitoId = null;
    if (!empty($body['obitoId'])) {
        $ob = $pdo->prepare('SELECT id FROM obitos WHERE codigo = ?');
        $ob->execute([$body['obitoId']]);
        $obitoId = $ob->fetchColumn() ?: null;
    }

    $pdo->beginTransaction();
    try {
        $codigo = gerar_codigo($pdo, 'guias', 'GA-2026', 5, 1000);
        $pdo->prepare(
            'INSERT INTO guias (codigo, obito_id, parceiro_id, cliente_id, cliente_nome_snapshot, cliente_vinculo_snapshot,
                servico, valor_acordado, emitida_por_usuario_id, status, coberto)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, \'Emitida\', ?)'
        )->execute([
            $codigo, $obitoId, $parceiroId, $contratoRow['cliente_id'], $clienteNome, $clienteVinculo,
            $servico, $valorAcordado, $usuario['id'], !empty($body['coberto']) ? 1 : 0,
        ]);
        $guiaId = (int) $pdo->lastInsertId();

        $pdo->prepare('INSERT INTO guia_historico (guia_id, status, quem) VALUES (?, \'Emitida\', ?)')
            ->execute([$guiaId, $usuario['nome']]);

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        json_error('Erro ao gerar guia.', 500);
    }

    json_response(['id' => $codigo], 201);
}

json_error('Método não permitido.', 405);
