<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

function formatar_plano(array $p): array {
    return [
        'id' => $p['codigo'],
        'nome' => $p['nome'],
        'valorMensal' => (float) $p['valor_mensal'],
        'carenciaDias' => (int) $p['carencia_dias'],
        'limiteDependentes' => (int) $p['limite_dependentes'],
        'reajuste' => $p['reajuste'],
        'coberturas' => $p['coberturas'] ? json_decode($p['coberturas']) : [],
    ];
}

if ($method === 'GET') {
    $planos = $pdo->query('SELECT * FROM planos_produto ORDER BY id ASC')->fetchAll();
    json_response(array_map('formatar_plano', $planos));
}

if ($method === 'POST') {
    $body = read_json_body();
    $nome = trim($body['nome'] ?? '');
    $valorMensal = isset($body['valorMensal']) ? (float) $body['valorMensal'] : 0;
    if ($nome === '' || $valorMensal <= 0) json_error('Nome e valor mensal são obrigatórios.', 400);

    $codigo = gerar_codigo($pdo, 'planos_produto', 'PL', 3);
    $pdo->prepare(
        'INSERT INTO planos_produto (codigo, nome, valor_mensal, carencia_dias, limite_dependentes, reajuste, coberturas)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $codigo, $nome, $valorMensal,
        (int) ($body['carenciaDias'] ?? 0), (int) ($body['limiteDependentes'] ?? 0),
        $body['reajuste'] ?? null,
        json_encode($body['coberturas'] ?? [], JSON_UNESCAPED_UNICODE),
    ]);

    json_response(['id' => $codigo], 201);
}

json_error('Método não permitido.', 405);
