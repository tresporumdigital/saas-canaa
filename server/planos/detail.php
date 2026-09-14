<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
$codigo = $_GET['id'] ?? '';
if ($codigo === '') json_error('ID inválido.', 400);

$stmt = $pdo->prepare('SELECT * FROM planos_produto WHERE codigo = ?');
$stmt->execute([$codigo]);
$plano = $stmt->fetch();
if (!$plano) json_error('Plano não encontrado.', 404);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    json_response([
        'id' => $plano['codigo'], 'nome' => $plano['nome'],
        'valorMensal' => (float) $plano['valor_mensal'],
        'carenciaDias' => (int) $plano['carencia_dias'],
        'limiteDependentes' => (int) $plano['limite_dependentes'],
        'reajuste' => $plano['reajuste'],
        'coberturas' => $plano['coberturas'] ? json_decode($plano['coberturas']) : [],
    ]);
}

if ($method === 'PUT') {
    $body = read_json_body();
    $pdo->prepare(
        'UPDATE planos_produto SET nome=?, valor_mensal=?, carencia_dias=?, limite_dependentes=?, reajuste=?, coberturas=? WHERE id=?'
    )->execute([
        trim($body['nome'] ?? $plano['nome']),
        isset($body['valorMensal']) ? (float) $body['valorMensal'] : $plano['valor_mensal'],
        isset($body['carenciaDias']) ? (int) $body['carenciaDias'] : $plano['carencia_dias'],
        isset($body['limiteDependentes']) ? (int) $body['limiteDependentes'] : $plano['limite_dependentes'],
        $body['reajuste'] ?? $plano['reajuste'],
        isset($body['coberturas']) ? json_encode($body['coberturas'], JSON_UNESCAPED_UNICODE) : $plano['coberturas'],
        $plano['id'],
    ]);

    json_response(['ok' => true]);
}

json_error('Método não permitido.', 405);
