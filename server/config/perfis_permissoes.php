<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

function formatar_perfil(array $p): array {
    return [
        'modulo' => $p['modulo'],
        'admin' => $p['admin'],
        'atendente' => $p['atendente'],
        'financeiro' => $p['financeiro'],
        'operacional' => $p['operacional'],
        'parceiro' => $p['parceiro'],
    ];
}

if ($method === 'GET') {
    $rows = $pdo->query('SELECT * FROM perfis_permissoes ORDER BY id')->fetchAll();
    json_response(array_map('formatar_perfil', $rows));
}

if ($method === 'PATCH') {
    $modulo = $_GET['modulo'] ?? '';
    if ($modulo === '') json_error('Módulo é obrigatório.', 400);

    $body = read_json_body();

    $stmt = $pdo->prepare('SELECT id FROM perfis_permissoes WHERE modulo = ?');
    $stmt->execute([$modulo]);
    if (!$stmt->fetch()) json_error('Módulo não encontrado.', 404);

    $pdo->prepare(
        'UPDATE perfis_permissoes SET admin = ?, atendente = ?, financeiro = ?, operacional = ?, parceiro = ? WHERE modulo = ?'
    )->execute([
        trim($body['admin'] ?? '') ?: null, trim($body['atendente'] ?? '') ?: null,
        trim($body['financeiro'] ?? '') ?: null, trim($body['operacional'] ?? '') ?: null,
        trim($body['parceiro'] ?? '') ?: null, $modulo,
    ]);

    json_response(['ok' => true]);
}

json_error('Método não permitido.', 405);
