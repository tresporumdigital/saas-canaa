<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$usuario = require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') json_error('Método não permitido.', 405);

$codigo = $_GET['id'] ?? '';
$body = read_json_body();
$status = $body['status'] ?? '';
if ($codigo === '' || !in_array($status, ['Pendente', 'Autorizada', 'Rejeitada', 'Cancelada'], true)) {
    json_error('Dados inválidos.', 400);
}

$stmt = $pdo->prepare('SELECT id FROM notas_fiscais WHERE codigo = ?');
$stmt->execute([$codigo]);
if (!$stmt->fetch()) json_error('Nota fiscal não encontrada.', 404);

if ($status === 'Autorizada') {
    $pdo->prepare('UPDATE notas_fiscais SET status = ?, emitida_em = NOW(), motivo_rejeicao = NULL WHERE codigo = ?')
        ->execute([$status, $codigo]);
} elseif ($status === 'Rejeitada') {
    $motivo = trim($body['motivoRejeicao'] ?? '') ?: null;
    $pdo->prepare('UPDATE notas_fiscais SET status = ?, motivo_rejeicao = ? WHERE codigo = ?')
        ->execute([$status, $motivo, $codigo]);
} else {
    $pdo->prepare('UPDATE notas_fiscais SET status = ? WHERE codigo = ?')->execute([$status, $codigo]);
}

if ($status === 'Cancelada') {
    registrar_auditoria($pdo, $usuario['id'], $usuario['nome'], 'Cancelou nota fiscal', $codigo);
}

json_response(['ok' => true, 'status' => $status]);
