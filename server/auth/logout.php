<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Método não permitido.', 405);

$token = bearer_token();
if ($token) {
    $pdo->prepare('DELETE FROM auth_tokens WHERE token = ?')->execute([$token]);
}

json_response(['ok' => true]);
