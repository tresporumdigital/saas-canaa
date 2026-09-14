<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
$codigo = $_GET['id'] ?? '';
if ($codigo === '') json_error('ID inválido.', 400);

$stmt = $pdo->prepare('SELECT * FROM usuarios WHERE codigo = ?');
$stmt->execute([$codigo]);
$u = $stmt->fetch();
if (!$u) json_error('Usuário não encontrado.', 404);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    json_response([
        'id' => $u['codigo'], 'nome' => $u['nome'], 'email' => $u['email'], 'perfil' => $u['perfil'],
        'status' => $u['status'], 'ultimoAcesso' => $u['ultimo_acesso'], 'doisFatores' => (bool) $u['dois_fatores'],
    ]);
}

if ($method === 'PUT') {
    $body = read_json_body();
    $perfil = $body['perfil'] ?? $u['perfil'];
    if (!in_array($perfil, ['Administrador', 'Atendente', 'Financeiro', 'Operacional'], true)) {
        json_error('Perfil inválido.', 400);
    }

    if (!empty($body['senha'])) {
        if (strlen($body['senha']) < 6) json_error('Senha deve ter ao menos 6 caracteres.', 400);
        $pdo->prepare('UPDATE usuarios SET senha_hash = ? WHERE id = ?')
            ->execute([password_hash($body['senha'], PASSWORD_BCRYPT), $u['id']]);
    }

    $pdo->prepare('UPDATE usuarios SET nome=?, perfil=?, dois_fatores=? WHERE id=?')->execute([
        trim($body['nome'] ?? $u['nome']), $perfil,
        isset($body['doisFatores']) ? (!empty($body['doisFatores']) ? 1 : 0) : $u['dois_fatores'],
        $u['id'],
    ]);

    json_response(['ok' => true]);
}

json_error('Método não permitido.', 405);
