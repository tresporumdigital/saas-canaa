<?php
declare(strict_types=1);
// Roda uma única vez via SSH para criar o primeiro administrador:
//   php create_admin.php "Nome Completo" "email@dominio.com" "senha"
// Nunca é exposto via HTTP (fica fora de qualquer diretório servido, ou é apagado depois de usado).

if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    exit('Só pode ser executado via CLI.');
}

[$nome, $email, $senha] = [$argv[1] ?? null, $argv[2] ?? null, $argv[3] ?? null];
if (!$nome || !$email || !$senha) {
    fwrite(STDERR, "Uso: php create_admin.php \"Nome\" \"email@dominio.com\" \"senha\"\n");
    exit(1);
}
if (strlen($senha) < 6) {
    fwrite(STDERR, "Senha deve ter ao menos 6 caracteres.\n");
    exit(1);
}

$config = require __DIR__ . '/../_config.php';
$pdo = new PDO(
    "mysql:host={$config['db_host']};dbname={$config['db_name']};charset=utf8mb4",
    $config['db_user'],
    $config['db_pass'],
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

$existe = $pdo->prepare('SELECT id FROM usuarios WHERE email = ?');
$existe->execute([strtolower(trim($email))]);
if ($existe->fetch()) {
    fwrite(STDERR, "Já existe um usuário com esse e-mail.\n");
    exit(1);
}

$stmt = $pdo->prepare("SELECT codigo FROM usuarios WHERE codigo LIKE 'USR-%' ORDER BY id DESC LIMIT 1");
$stmt->execute();
$ultimo = $stmt->fetchColumn();
$numero = 1;
if ($ultimo) {
    $partes = explode('-', $ultimo);
    $numero = ((int) end($partes)) + 1;
}
$codigo = 'USR-' . str_pad((string) $numero, 2, '0', STR_PAD_LEFT);

$pdo->prepare(
    'INSERT INTO usuarios (codigo, nome, email, senha_hash, perfil, status, dois_fatores) VALUES (?, ?, ?, ?, \'Administrador\', \'Ativo\', 0)'
)->execute([$codigo, trim($nome), strtolower(trim($email)), password_hash($senha, PASSWORD_BCRYPT)]);

echo "Administrador $codigo criado: $nome <$email>\n";
