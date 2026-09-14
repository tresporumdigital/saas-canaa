<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método não permitido.', 405);

$usuario = require_auth($pdo);

json_response(['usuario' => [
    'id' => $usuario['codigo'],
    'nome' => $usuario['nome'],
    'email' => $usuario['email'],
    'perfil' => $usuario['perfil'],
    'status' => $usuario['status'],
    'dois_fatores' => $usuario['dois_fatores'],
]]);
