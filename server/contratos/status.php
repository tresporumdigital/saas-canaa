<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') json_error('Método não permitido.', 405);

$codigo = $_GET['id'] ?? '';
$body = read_json_body();
$situacao = $body['situacao'] ?? '';
if ($codigo === '' || !in_array($situacao, ['Ativo', 'Em atraso', 'Suspenso', 'Cancelado', 'Encerrado'], true)) {
    json_error('Dados inválidos.', 400);
}

$stmt = $pdo->prepare('SELECT id FROM contratos WHERE codigo = ?');
$stmt->execute([$codigo]);
$contratoId = $stmt->fetchColumn();
if (!$contratoId) json_error('Contrato não encontrado.', 404);

if ($situacao === 'Cancelado') {
    $pdo->prepare('UPDATE contratos SET situacao = ?, cancelado_em = CURDATE(), motivo_cancelamento = ? WHERE id = ?')
        ->execute([$situacao, $body['motivoCancelamento'] ?? null, $contratoId]);
} else {
    $pdo->prepare('UPDATE contratos SET situacao = ? WHERE id = ?')->execute([$situacao, $contratoId]);
}

json_response(['ok' => true, 'situacao' => $situacao]);
