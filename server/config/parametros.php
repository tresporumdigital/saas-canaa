<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

function formatar_parametro(array $p): array {
    return ['chave' => $p['chave'], 'valor' => $p['valor']];
}

if ($method === 'GET') {
    $rows = $pdo->query('SELECT * FROM parametros ORDER BY id')->fetchAll();
    json_response(array_map('formatar_parametro', $rows));
}

if ($method === 'PATCH') {
    $chave = $_GET['chave'] ?? '';
    if ($chave === '') json_error('Chave é obrigatória.', 400);

    $body = read_json_body();
    $valor = trim($body['valor'] ?? '');
    if ($valor === '') json_error('Valor é obrigatório.', 400);

    $stmt = $pdo->prepare('SELECT id FROM parametros WHERE chave = ?');
    $stmt->execute([$chave]);
    if (!$stmt->fetch()) json_error('Parâmetro não encontrado.', 404);

    $pdo->prepare('UPDATE parametros SET valor = ? WHERE chave = ?')->execute([$valor, $chave]);

    json_response(['ok' => true]);
}

json_error('Método não permitido.', 405);
