<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') json_error('Método não permitido.', 405);

$codigo = $_GET['id'] ?? '';
$body = read_json_body();
$status = $body['status'] ?? '';
if ($codigo === '' || !in_array($status, ['Ativo', 'Inativo'], true)) json_error('Dados inválidos.', 400);

$stmt = $pdo->prepare('SELECT id FROM usuarios WHERE codigo = ?');
$stmt->execute([$codigo]);
if (!$stmt->fetch()) json_error('Usuário não encontrado.', 404);

$pdo->prepare('UPDATE usuarios SET status = ? WHERE codigo = ?')->execute([$status, $codigo]);

json_response(['ok' => true, 'status' => $status]);
