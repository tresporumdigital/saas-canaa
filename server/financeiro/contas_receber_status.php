<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') json_error('Método não permitido.', 405);

$codigo = $_GET['id'] ?? '';
$body = read_json_body();
$status = $body['status'] ?? '';
if ($codigo === '' || !in_array($status, ['Em aberto', 'Pago', 'Negociado'], true)) {
    json_error('Dados inválidos.', 400);
}

$stmt = $pdo->prepare('SELECT id FROM contas_receber WHERE codigo = ?');
$stmt->execute([$codigo]);
if (!$stmt->fetch()) json_error('Lançamento não encontrado.', 404);

$pagoEm = $status === 'Pago' ? date('Y-m-d H:i:s') : null;
$pdo->prepare('UPDATE contas_receber SET status = ?, pago_em = ? WHERE codigo = ?')->execute([$status, $pagoEm, $codigo]);

json_response(['ok' => true, 'status' => $status]);
