<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método não permitido.', 405);

$codigo = $_GET['id'] ?? '';
if ($codigo === '') json_error('ID inválido.', 400);

$stmt = $pdo->prepare(
    'SELECT c.*, cl.codigo AS cliente_codigo, p.codigo AS plano_codigo, u.nome AS vendedor_nome
     FROM contratos c
     JOIN clientes cl ON cl.id = c.cliente_id
     JOIN planos_produto p ON p.id = c.plano_id
     LEFT JOIN usuarios u ON u.id = c.vendedor_usuario_id
     WHERE c.codigo = ?'
);
$stmt->execute([$codigo]);
$c = $stmt->fetch();
if (!$c) json_error('Contrato não encontrado.', 404);

$parcelasStmt = $pdo->prepare(
    'SELECT numero, competencia, vencimento, valor, status, pago_em, forma FROM contrato_parcelas
     WHERE contrato_id = ? ORDER BY numero DESC'
);
$parcelasStmt->execute([$c['id']]);

$parcelas = array_map(function ($p) use ($c) {
    return [
        'id' => $c['codigo'] . '-P' . str_pad((string) $p['numero'], 2, '0', STR_PAD_LEFT),
        'contratoId' => $c['codigo'],
        'competencia' => formatar_competencia($p['competencia']),
        'vencimento' => $p['vencimento'],
        'valor' => (float) $p['valor'],
        'status' => status_parcela_exibido($p['status'], $p['vencimento']),
        'pagoEm' => $p['pago_em'],
        'forma' => $p['forma'] ?? $c['forma_pagamento'],
    ];
}, $parcelasStmt->fetchAll());

json_response([
    'id' => $c['codigo'],
    'clienteId' => $c['cliente_codigo'],
    'planoId' => $c['plano_codigo'],
    'inicio' => $c['inicio'],
    'diaVencimento' => (int) $c['dia_vencimento'],
    'formaPagamento' => $c['forma_pagamento'],
    'vendedor' => $c['vendedor_nome'],
    'situacao' => $c['situacao'],
    'canceladoEm' => $c['cancelado_em'],
    'motivoCancelamento' => $c['motivo_cancelamento'],
    'parcelas' => $parcelas,
]);
