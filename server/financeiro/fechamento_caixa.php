<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método não permitido.', 405);

$data = $_GET['data'] ?? date('Y-m-d');
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data)) json_error('Data inválida.', 400);

$stmt = $pdo->prepare(
    "SELECT meio, COUNT(*) AS qtd, SUM(valor) AS total
     FROM pagamentos
     WHERE DATE(recebido_em) = ? AND status != 'Exceção'
     GROUP BY meio"
);
$stmt->execute([$data]);

json_response(array_map(function (array $r): array {
    return ['forma' => $r['meio'], 'valor' => (float) $r['total'], 'qtd' => (int) $r['qtd']];
}, $stmt->fetchAll()));
