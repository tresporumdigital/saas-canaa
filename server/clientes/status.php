<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$usuario = require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') json_error('Método não permitido.', 405);

$codigo = $_GET['id'] ?? '';
$body = read_json_body();
$status = $body['status'] ?? '';
if ($codigo === '' || !in_array($status, ['Ativo', 'Inativo'], true)) json_error('Dados inválidos.', 400);

$stmt = $pdo->prepare('SELECT id FROM clientes WHERE codigo = ?');
$stmt->execute([$codigo]);
$cliente = $stmt->fetch();
if (!$cliente) json_error('Cliente não encontrado.', 404);

$pdo->prepare('UPDATE clientes SET status = ? WHERE id = ?')->execute([$status, $cliente['id']]);
$pdo->prepare('INSERT INTO cliente_historico (cliente_id, usuario_id, oque) VALUES (?, ?, ?)')
    ->execute([$cliente['id'], $usuario['id'], "Cadastro definido como \"$status\""]);

json_response(['ok' => true, 'status' => $status]);
