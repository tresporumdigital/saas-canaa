<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método não permitido.', 405);

$rows = $pdo->query(
    "SELECT valor, DATEDIFF(CURDATE(), vencimento) AS atraso
     FROM contas_receber
     WHERE vencimento < CURDATE() AND status IN ('Em aberto', 'Negociado')"
)->fetchAll();

$buckets = [
    '1–30 dias' => 0.0,
    '31–60 dias' => 0.0,
    '61–90 dias' => 0.0,
    '+90 dias' => 0.0,
];

foreach ($rows as $r) {
    $atraso = (int) $r['atraso'];
    $valor = (float) $r['valor'];
    if ($atraso <= 30) $buckets['1–30 dias'] += $valor;
    elseif ($atraso <= 60) $buckets['31–60 dias'] += $valor;
    elseif ($atraso <= 90) $buckets['61–90 dias'] += $valor;
    else $buckets['+90 dias'] += $valor;
}

json_response(array_map(fn ($label, $value) => ['label' => $label, 'value' => $value], array_keys($buckets), array_values($buckets)));
