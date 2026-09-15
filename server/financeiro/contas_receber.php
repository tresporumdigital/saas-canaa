<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$usuario = require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

function formatar_conta_receber(array $c): array {
    return [
        'id' => $c['codigo'],
        'origem' => $c['origem'],
        'ref' => $c['ref'],
        'clienteNome' => $c['cliente_nome'],
        'categoria' => $c['categoria'],
        'centroCusto' => $c['centro_custo'],
        'vencimento' => $c['vencimento'],
        'valor' => (float) $c['valor'],
        'status' => status_parcela_exibido($c['status'], $c['vencimento']),
    ];
}

if ($method === 'GET') {
    $rows = $pdo->query('SELECT * FROM contas_receber ORDER BY id DESC')->fetchAll();
    json_response(array_map('formatar_conta_receber', $rows));
}

if ($method === 'POST') {
    $body = read_json_body();
    $clienteNome = trim($body['clienteNome'] ?? '');
    $categoria = trim($body['categoria'] ?? '');
    $centroCusto = trim($body['centroCusto'] ?? '');
    $vencimento = $body['vencimento'] ?? '';
    $valor = isset($body['valor']) ? (float) $body['valor'] : 0;
    $status = $body['status'] ?? 'Em aberto';

    if ($clienteNome === '' || $categoria === '' || $centroCusto === '' || $vencimento === '' || $valor <= 0
        || !in_array($status, ['Em aberto', 'Pago', 'Negociado'], true)) {
        json_error('Dados do lançamento incompletos.', 400);
    }

    $pagoEm = $status === 'Pago' ? date('Y-m-d H:i:s') : null;

    $pdo->beginTransaction();
    try {
        $codigo = gerar_codigo($pdo, 'contas_receber', 'AR-2026', 4, 1001);
        $pdo->prepare(
            'INSERT INTO contas_receber (codigo, origem, ref, cliente_nome, categoria, centro_custo, vencimento,
                valor, status, pago_em, criado_por_usuario_id)
             VALUES (?, \'Lançamento manual\', NULL, ?, ?, ?, ?, ?, ?, ?, ?)'
        )->execute([$codigo, $clienteNome, $categoria, $centroCusto, $vencimento, $valor, $status, $pagoEm, $usuario['id']]);

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        json_error('Erro ao lançar a conta.', 500);
    }

    json_response(['id' => $codigo], 201);
}

json_error('Método não permitido.', 405);
