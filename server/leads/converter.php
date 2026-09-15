<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') json_error('Método não permitido.', 405);

$codigo = $_GET['id'] ?? '';
$body = read_json_body();
$clienteCodigo = trim($body['clienteId'] ?? '');

if ($codigo === '' || $clienteCodigo === '') json_error('Dados inválidos.', 400);

$lead = $pdo->prepare('SELECT id, status FROM leads WHERE codigo = ?');
$lead->execute([$codigo]);
$leadRow = $lead->fetch();
if (!$leadRow) json_error('Lead não encontrado.', 404);
if ($leadRow['status'] === 'Convertido') json_error('Lead já foi convertido.', 409);

$cliente = $pdo->prepare('SELECT id FROM clientes WHERE codigo = ?');
$cliente->execute([$clienteCodigo]);
$clienteId = $cliente->fetchColumn();
if (!$clienteId) json_error('Cliente não encontrado.', 404);

$pdo->prepare("UPDATE leads SET status = 'Convertido', cliente_id = ?, motivo_perda = NULL WHERE codigo = ?")
    ->execute([$clienteId, $codigo]);

json_response(['ok' => true, 'status' => 'Convertido', 'clienteId' => $clienteCodigo]);
