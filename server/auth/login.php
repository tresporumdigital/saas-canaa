<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Método não permitido.', 405);

$body = read_json_body();
$email = strtolower(trim($body['email'] ?? ''));
$senha = (string) ($body['senha'] ?? '');

if ($email === '' || $senha === '') json_error('Informe e-mail e senha.', 400);

$stmt = $pdo->prepare('SELECT id, codigo, nome, email, senha_hash, perfil, status, dois_fatores FROM usuarios WHERE email = ?');
$stmt->execute([$email]);
$usuario = $stmt->fetch();

if (!$usuario || !password_verify($senha, $usuario['senha_hash'])) {
    registrar_auditoria($pdo, $usuario['id'] ?? null, $usuario['nome'] ?? $email, 'Falha de login');
    json_error('E-mail ou senha inválidos.', 401);
}
if ($usuario['status'] !== 'Ativo') {
    registrar_auditoria($pdo, $usuario['id'], $usuario['nome'], 'Login bloqueado — usuário inativo');
    json_error('Usuário inativo. Contate um administrador.', 403);
}

registrar_auditoria($pdo, $usuario['id'], $usuario['nome'], 'Login');

$token = bin2hex(random_bytes(32));
$expiraEm = (new DateTime('+7 days'))->format('Y-m-d H:i:s');

$pdo->prepare('INSERT INTO auth_tokens (token, usuario_id, expira_em) VALUES (?, ?, ?)')
    ->execute([$token, $usuario['id'], $expiraEm]);

$pdo->prepare('UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = ?')->execute([$usuario['id']]);

$usuarioResp = [
    'id' => $usuario['codigo'],
    'nome' => $usuario['nome'],
    'email' => $usuario['email'],
    'perfil' => $usuario['perfil'],
    'status' => $usuario['status'],
    'dois_fatores' => (bool) $usuario['dois_fatores'],
];

json_response(['token' => $token, 'usuario' => $usuarioResp]);
