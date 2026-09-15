<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método não permitido.', 405);

$meses = [];
for ($i = 7; $i >= 0; $i--) {
    $meses[] = date('Y-m', strtotime("-$i months"));
}
$desde = $meses[0] . '-01';

$entradasPorMes = [];
$stmtE = $pdo->prepare(
    "SELECT DATE_FORMAT(recebido_em, '%Y-%m') AS ym, SUM(valor) AS total
     FROM pagamentos WHERE status != 'Exceção' AND recebido_em >= ? GROUP BY ym"
);
$stmtE->execute([$desde]);
foreach ($stmtE->fetchAll() as $r) { $entradasPorMes[$r['ym']] = (float) $r['total']; }

$saidasPorMes = [];
$stmtS = $pdo->prepare(
    "SELECT DATE_FORMAT(pago_em, '%Y-%m') AS ym, SUM(valor) AS total
     FROM contas_pagar WHERE status = 'Pago' AND pago_em >= ? GROUP BY ym"
);
$stmtS->execute([$desde]);
foreach ($stmtS->fetchAll() as $r) { $saidasPorMes[$r['ym']] = (float) $r['total']; }

json_response(array_map(function ($ym) use ($entradasPorMes, $saidasPorMes) {
    return [
        'mes' => formatar_competencia("$ym-01"),
        'entradas' => $entradasPorMes[$ym] ?? 0.0,
        'saidas' => $saidasPorMes[$ym] ?? 0.0,
    ];
}, $meses));
