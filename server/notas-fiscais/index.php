<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$usuario = require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

function formatar_nota(array $n): array {
    return [
        'id' => $n['codigo'],
        'tipo' => $n['tipo'],
        'origemTipo' => $n['origem_tipo'],
        'origemRef' => $n['origem_ref'],
        'clienteNome' => $n['cliente_nome'],
        'valor' => (float) $n['valor'],
        'impostos' => (float) $n['impostos'],
        'status' => $n['status'],
        'emitidaEm' => $n['emitida_em'],
        'numero' => $n['numero'],
        'motivoRejeicao' => $n['motivo_rejeicao'],
    ];
}

if ($method === 'GET') {
    $sql = 'SELECT * FROM notas_fiscais WHERE 1=1';
    $params = [];
    if (!empty($_GET['clienteNome'])) { $sql .= ' AND cliente_nome = ?'; $params[] = $_GET['clienteNome']; }
    if (!empty($_GET['origemRef'])) { $sql .= ' AND origem_ref = ?'; $params[] = $_GET['origemRef']; }
    $sql .= ' ORDER BY id DESC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    json_response(array_map('formatar_nota', $stmt->fetchAll()));
}

if ($method === 'POST') {
    $body = read_json_body();
    $tipo = $body['tipo'] ?? '';
    $origemTipo = $body['origemTipo'] ?? '';
    $origemRef = trim($body['origemRef'] ?? '');
    $clienteNome = trim($body['clienteNome'] ?? '');
    $valor = isset($body['valor']) ? (float) $body['valor'] : 0;
    $impostos = isset($body['impostos']) ? (float) $body['impostos'] : 0;
    $vendaCodigo = trim($body['vendaId'] ?? '');

    if (!in_array($tipo, ['NFS-e', 'NF-e'], true)
        || !in_array($origemTipo, ['Atendimento', 'Contrato', 'Venda de equipamento', 'Emissão manual'], true)
        || $origemRef === '' || $clienteNome === '' || $valor <= 0) {
        json_error('Dados da nota fiscal incompletos.', 400);
    }

    $vendaId = null;
    if ($vendaCodigo !== '') {
        $venda = $pdo->prepare('SELECT id FROM vendas_equipamento WHERE codigo = ?');
        $venda->execute([$vendaCodigo]);
        $vendaId = $venda->fetchColumn();
        if (!$vendaId) json_error('Venda não encontrada.', 404);
    }

    $pdo->beginTransaction();
    try {
        $codigo = gerar_codigo($pdo, 'notas_fiscais', 'NF-2026', 4, 1001);
        $pdo->prepare(
            'INSERT INTO notas_fiscais (codigo, tipo, origem_tipo, origem_ref, cliente_nome, valor, impostos, criado_por_usuario_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        )->execute([$codigo, $tipo, $origemTipo, $origemRef, $clienteNome, $valor, $impostos, $usuario['id']]);

        if ($vendaId) {
            $pdo->prepare('UPDATE vendas_equipamento SET nota_fiscal_id = ? WHERE id = ?')->execute([$codigo, $vendaId]);
        }

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        json_error('Erro ao gerar a nota fiscal.', 500);
    }

    json_response(['id' => $codigo], 201);
}

json_error('Método não permitido.', 405);
