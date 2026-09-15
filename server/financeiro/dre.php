<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método não permitido.', 405);

$mes = $_GET['mes'] ?? date('Y-m');
if (!preg_match('/^\d{4}-\d{2}$/', $mes)) json_error('Parâmetro "mes" inválido.', 400);
$inicio = "$mes-01";
$fim = date('Y-m-d', strtotime("$inicio +1 month"));

$stmtReceber = $pdo->prepare(
    "SELECT categoria, SUM(valor) AS total FROM contas_receber
     WHERE status = 'Pago' AND pago_em >= ? AND pago_em < ? GROUP BY categoria"
);
$stmtReceber->execute([$inicio, $fim]);
$receitas = array_map(fn ($r) => ['categoria' => $r['categoria'], 'valor' => (float) $r['total']], $stmtReceber->fetchAll());

$stmtParcelas = $pdo->prepare(
    "SELECT COALESCE(SUM(valor), 0) AS total FROM pagamentos
     WHERE status != 'Exceção' AND recebido_em >= ? AND recebido_em < ?"
);
$stmtParcelas->execute([$inicio, $fim]);
$totalParcelas = (float) $stmtParcelas->fetchColumn();
if ($totalParcelas > 0) {
    array_unshift($receitas, ['categoria' => 'Mensalidades de contratos (parcelas)', 'valor' => $totalParcelas]);
}

$stmtPagar = $pdo->prepare(
    "SELECT categoria, SUM(valor) AS total FROM contas_pagar
     WHERE status = 'Pago' AND pago_em >= ? AND pago_em < ? GROUP BY categoria"
);
$stmtPagar->execute([$inicio, $fim]);
$despesas = array_map(fn ($r) => ['categoria' => $r['categoria'], 'valor' => (float) $r['total']], $stmtPagar->fetchAll());

$totalReceitas = array_reduce($receitas, fn ($s, $r) => $s + $r['valor'], 0.0);
$totalDespesas = array_reduce($despesas, fn ($s, $r) => $s + $r['valor'], 0.0);

json_response([
    'competencia' => formatar_competencia("$mes-01"),
    'receitas' => $receitas,
    'despesas' => $despesas,
    'totalReceitas' => $totalReceitas,
    'totalDespesas' => $totalDespesas,
    'resultado' => $totalReceitas - $totalDespesas,
]);
