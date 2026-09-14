<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$usuario = require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') json_error('Método não permitido.', 405);

$codigo = $_GET['id'] ?? '';
$body = read_json_body();
$status = $body['status'] ?? '';
$validos = ['Emitida', 'Enviada', 'Aceita', 'Em execução', 'Concluída', 'Faturada', 'Cancelada'];
if ($codigo === '' || !in_array($status, $validos, true)) json_error('Dados inválidos.', 400);

if ($status === 'Cancelada' && strlen(trim($body['justificativa'] ?? '')) < 10) {
    json_error('Justificativa obrigatória (mínimo 10 caracteres) para cancelar.', 400);
}

$stmt = $pdo->prepare('SELECT id FROM guias WHERE codigo = ?');
$stmt->execute([$codigo]);
$guiaId = $stmt->fetchColumn();
if (!$guiaId) json_error('Guia não encontrada.', 404);

$pdo->beginTransaction();
try {
    if ($status === 'Cancelada') {
        $pdo->prepare('UPDATE guias SET status = ?, cancelada_justificativa = ? WHERE id = ?')
            ->execute([$status, trim($body['justificativa']), $guiaId]);
    } else {
        $pdo->prepare('UPDATE guias SET status = ? WHERE id = ?')->execute([$status, $guiaId]);
    }
    $pdo->prepare('INSERT INTO guia_historico (guia_id, status, quem) VALUES (?, ?, ?)')
        ->execute([$guiaId, $status, $usuario['nome']]);
    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    json_error('Erro ao atualizar a guia.', 500);
}

json_response(['ok' => true, 'status' => $status]);
