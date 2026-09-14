<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

function formatar_usuario(array $u): array {
    return [
        'id' => $u['codigo'],
        'nome' => $u['nome'],
        'email' => $u['email'],
        'perfil' => $u['perfil'],
        'status' => $u['status'],
        'ultimoAcesso' => $u['ultimo_acesso'],
        'doisFatores' => (bool) $u['dois_fatores'],
    ];
}

if ($method === 'GET') {
    $usuarios = $pdo->query('SELECT * FROM usuarios ORDER BY id ASC')->fetchAll();
    json_response(array_map('formatar_usuario', $usuarios));
}

if ($method === 'POST') {
    $body = read_json_body();
    $nome = trim($body['nome'] ?? '');
    $email = strtolower(trim($body['email'] ?? ''));
    $senha = (string) ($body['senha'] ?? '');
    $perfil = $body['perfil'] ?? 'Atendente';

    if ($nome === '' || $email === '' || strlen($senha) < 6) {
        json_error('Nome, e-mail e senha (mínimo 6 caracteres) são obrigatórios.', 400);
    }
    if (!in_array($perfil, ['Administrador', 'Atendente', 'Financeiro', 'Operacional'], true)) {
        json_error('Perfil inválido.', 400);
    }

    $existe = $pdo->prepare('SELECT id FROM usuarios WHERE email = ?');
    $existe->execute([$email]);
    if ($existe->fetch()) json_error('Já existe um usuário com esse e-mail.', 409);

    $codigo = gerar_codigo($pdo, 'usuarios', 'USR', 2);
    $pdo->prepare(
        'INSERT INTO usuarios (codigo, nome, email, senha_hash, perfil, status, dois_fatores) VALUES (?, ?, ?, ?, ?, \'Ativo\', ?)'
    )->execute([
        $codigo, $nome, $email, password_hash($senha, PASSWORD_BCRYPT), $perfil, !empty($body['doisFatores']) ? 1 : 0,
    ]);

    json_response(['id' => $codigo], 201);
}

json_error('Método não permitido.', 405);
