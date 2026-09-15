<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') json_error('Método não permitido.', 405);

$codigo = $_GET['id'] ?? '';
$body = read_json_body();
$status = $body['status'] ?? '';

// "Convertido" só acontece via converter.php (precisa vincular um cliente).
if ($codigo === '' || !in_array($status, ['Novo', 'Em contato', 'Perdido'], true)) {
    json_error('Dados inválidos.', 400);
}

$stmt = $pdo->prepare('SELECT id FROM leads WHERE codigo = ?');
$stmt->execute([$codigo]);
if (!$stmt->fetch()) json_error('Lead não encontrado.', 404);

$motivoPerda = $status === 'Perdido' ? trim($body['motivoPerda'] ?? '') : null;
$motivoPerda = $motivoPerda === '' ? null : $motivoPerda;

$pdo->prepare('UPDATE leads SET status = ?, motivo_perda = ? WHERE codigo = ?')
    ->execute([$status, $motivoPerda, $codigo]);

json_response(['ok' => true, 'status' => $status]);
