<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$usuario = require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

function formatar_conta_pagar(array $c): array {
    return [
        'id' => $c['codigo'],
        'origem' => $c['origem'],
        'ref' => $c['parceiro_codigo'],
        'favorecido' => $c['favorecido'],
        'categoria' => $c['categoria'],
        'centroCusto' => $c['centro_custo'],
        'vencimento' => $c['vencimento'],
        'valor' => (float) $c['valor'],
        'status' => status_parcela_exibido($c['status'], $c['vencimento']),
        'lote' => $c['lote'],
    ];
}

function addMonthsYmd(string $ymd, int $n): string {
    $dt = new DateTime($ymd);
    $dt->modify("+$n month");
    return $dt->format('Y-m-d');
}

if ($method === 'GET') {
    $rows = $pdo->query(
        'SELECT cp.*, pa.codigo AS parceiro_codigo
         FROM contas_pagar cp
         LEFT JOIN parceiros pa ON pa.id = cp.parceiro_id
         ORDER BY cp.id DESC'
    )->fetchAll();
    json_response(array_map('formatar_conta_pagar', $rows));
}

if ($method === 'POST') {
    $body = read_json_body();
    $favorecido = trim($body['favorecido'] ?? '');
    $categoria = trim($body['categoria'] ?? '');
    $centroCusto = trim($body['centroCusto'] ?? '');
    $vencimento = $body['vencimento'] ?? '';
    $valor = isset($body['valor']) ? (float) $body['valor'] : 0;
    $status = $body['status'] ?? 'Em aberto';
    $recorrente = !empty($body['recorrente']);
    $recorrencias = $recorrente ? max(2, min(60, (int) ($body['recorrencias'] ?? 1))) : 1;

    if ($favorecido === '' || $categoria === '' || $centroCusto === '' || $vencimento === '' || $valor <= 0
        || !in_array($status, ['Em aberto', 'Pago', 'Negociado'], true)) {
        json_error('Dados do lançamento incompletos.', 400);
    }

    $pagoEm = $status === 'Pago' ? date('Y-m-d H:i:s') : null;
    $lote = $recorrente ? 'LOTE-' . date('Ymd-His') : null;

    $pdo->beginTransaction();
    try {
        $primeiroCodigo = null;
        $ins = $pdo->prepare(
            'INSERT INTO contas_pagar (codigo, origem, parceiro_id, favorecido, categoria, centro_custo,
                vencimento, valor, status, pago_em, lote, criado_por_usuario_id)
             VALUES (?, \'Despesa fixa\', NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        for ($i = 0; $i < $recorrencias; $i++) {
            $codigo = gerar_codigo($pdo, 'contas_pagar', 'AP-2026', 4, 1001);
            $venc = $i === 0 ? $vencimento : addMonthsYmd($vencimento, $i);
            $ins->execute([$codigo, $favorecido, $categoria, $centroCusto, $venc, $valor, $status, $pagoEm, $lote, $usuario['id']]);
            if ($primeiroCodigo === null) $primeiroCodigo = $codigo;
        }

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        json_error('Erro ao lançar a conta.', 500);
    }

    json_response(['id' => $primeiroCodigo, 'total' => $recorrencias, 'lote' => $lote], 201);
}

json_error('Método não permitido.', 405);
