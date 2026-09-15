<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$usuario = require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

function formatar_baixa(array $b): array {
    return [
        'id' => $b['codigo'],
        'parceiroId' => $b['parceiro_codigo'],
        'clienteNome' => $b['cliente_nome'],
        'contratoRef' => $b['contrato_codigo'],
        'servicoPrestado' => $b['servico_prestado'],
        'dataHora' => $b['data_hora'],
        'valor' => (float) $b['valor'],
        'observacoes' => $b['observacoes'],
        'status' => $b['status'],
        'comprovante' => (bool) $b['comprovante'],
        'ip' => $b['ip'],
        'usuarioPortal' => $b['usuario_portal'],
    ];
}

if ($method === 'GET') {
    $sql = 'SELECT bp.*, pa.codigo AS parceiro_codigo, ct.codigo AS contrato_codigo
            FROM baixas_parceiro bp
            JOIN parceiros pa ON pa.id = bp.parceiro_id
            JOIN contratos ct ON ct.id = bp.contrato_id
            WHERE 1=1';
    $params = [];
    if (!empty($_GET['parceiroId'])) { $sql .= ' AND pa.codigo = ?'; $params[] = $_GET['parceiroId']; }
    $sql .= ' ORDER BY bp.id DESC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    json_response(array_map('formatar_baixa', $stmt->fetchAll()));
}

if ($method === 'POST') {
    $body = read_json_body();
    $parceiroCodigo = $body['parceiroId'] ?? '';
    $clienteCodigo = $body['clienteId'] ?? '';
    $contratoCodigo = $body['contratoId'] ?? '';
    $servico = trim($body['servicoPrestado'] ?? '');
    $dataHora = $body['dataHora'] ?? '';
    $valor = isset($body['valor']) ? (float) $body['valor'] : 0;

    if ($parceiroCodigo === '' || $clienteCodigo === '' || $contratoCodigo === ''
        || $servico === '' || $dataHora === '' || $valor <= 0) {
        json_error('Dados da baixa incompletos.', 400);
    }

    $parceiro = $pdo->prepare('SELECT id FROM parceiros WHERE codigo = ?');
    $parceiro->execute([$parceiroCodigo]);
    $parceiroId = $parceiro->fetchColumn();
    if (!$parceiroId) json_error('Parceiro não encontrado.', 404);

    $cliente = $pdo->prepare('SELECT id, nome FROM clientes WHERE codigo = ?');
    $cliente->execute([$clienteCodigo]);
    $clienteRow = $cliente->fetch();
    if (!$clienteRow) json_error('Cliente não encontrado.', 404);

    $contrato = $pdo->prepare('SELECT id FROM contratos WHERE codigo = ?');
    $contrato->execute([$contratoCodigo]);
    $contratoId = $contrato->fetchColumn();
    if (!$contratoId) json_error('Contrato não encontrado.', 404);

    $status = $valor > 1500 ? 'Aguardando aprovação' : 'Aprovado';
    $ip = $_SERVER['REMOTE_ADDR'] ?? null;

    $pdo->beginTransaction();
    try {
        $codigo = gerar_codigo($pdo, 'baixas_parceiro', 'BX-2026', 4, 1001);
        $pdo->prepare(
            'INSERT INTO baixas_parceiro (codigo, parceiro_id, cliente_id, cliente_nome, contrato_id,
                servico_prestado, data_hora, valor, observacoes, comprovante, status, ip, usuario_portal)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        )->execute([
            $codigo, $parceiroId, $clienteRow['id'], $clienteRow['nome'], $contratoId,
            $servico, $dataHora, $valor, trim($body['observacoes'] ?? '') ?: null,
            !empty($body['comprovante']) ? 1 : 0, $status, $ip, $usuario['nome'],
        ]);

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        json_error('Erro ao registrar a baixa.', 500);
    }

    json_response(['id' => $codigo, 'status' => $status], 201);
}

json_error('Método não permitido.', 405);
