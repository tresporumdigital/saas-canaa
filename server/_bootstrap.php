<?php
declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function json_response($data, int $status = 200): void {
    http_response_code($status);
    echo json_encode(['data' => $data], JSON_UNESCAPED_UNICODE);
    exit;
}

function json_error(string $message, int $status = 400): void {
    http_response_code($status);
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function read_json_body(): array {
    $raw = file_get_contents('php://input');
    if ($raw === '' || $raw === false) return [];
    $data = json_decode($raw, true);
    if (!is_array($data)) json_error('Corpo da requisição inválido.', 400);
    return $data;
}

function only_digits(?string $v): string {
    return preg_replace('/\D/', '', (string) $v);
}

$configFile = __DIR__ . '/_config.php';
if (!file_exists($configFile)) {
    json_error('Configuração do servidor ausente. Copie _config.example.php para _config.php.', 500);
}
$config = require $configFile;

try {
    $pdo = new PDO(
        "mysql:host={$config['db_host']};dbname={$config['db_name']};charset=utf8mb4",
        $config['db_user'],
        $config['db_pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    json_error('Falha ao conectar ao banco de dados.', 500);
}

function bearer_token(): ?string {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? '');
    if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $m)) return null;
    return trim($m[1]);
}

function require_auth(PDO $pdo): array {
    $token = bearer_token();
    if (!$token) json_error('Não autenticado.', 401);

    $stmt = $pdo->prepare(
        'SELECT u.id, u.codigo, u.nome, u.email, u.perfil, u.status, u.dois_fatores, u.ultimo_acesso
         FROM auth_tokens t
         JOIN usuarios u ON u.id = t.usuario_id
         WHERE t.token = ? AND t.expira_em > NOW()'
    );
    $stmt->execute([$token]);
    $usuario = $stmt->fetch();
    if (!$usuario) json_error('Sessão inválida ou expirada.', 401);
    if ($usuario['status'] !== 'Ativo') json_error('Usuário inativo.', 403);

    $usuario['dois_fatores'] = (bool) $usuario['dois_fatores'];
    return $usuario;
}

// Gera o próximo código exibido (CLI-0001, PAR-001, UNI-01, USR-01...) olhando o maior já usado.
// $inicio evita colisão com os códigos que os módulos ainda mockados (contratos, óbitos,
// guias, equipamentos...) usam para clientes/parceiros fictícios (CLI-0001..0020, PAR-001..008)
// — sem isso, o primeiro cliente/parceiro real herdaria o histórico fictício de um desses ids.
function gerar_codigo(PDO $pdo, string $tabela, string $prefixo, int $largura, int $inicio = 1): string {
    $stmt = $pdo->prepare("SELECT codigo FROM `$tabela` WHERE codigo LIKE ? ORDER BY id DESC LIMIT 1");
    $stmt->execute(["$prefixo-%"]);
    $ultimo = $stmt->fetchColumn();
    $numero = $inicio;
    if ($ultimo) {
        $partes = explode('-', $ultimo);
        $numero = max($inicio, ((int) end($partes)) + 1);
    }
    return $prefixo . '-' . str_pad((string) $numero, $largura, '0', STR_PAD_LEFT);
}
