<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$usuario = require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') json_error('Método não permitido.', 405);

$codigo = $_GET['id'] ?? '';
$body = read_json_body();
$status = $body['status'] ?? '';
if ($codigo === '' || !in_array($status, ['Aprovado', 'Estornado'], true)) {
    json_error('Dados inválidos.', 400);
}

$stmt = $pdo->prepare('SELECT id FROM baixas_parceiro WHERE codigo = ?');
$stmt->execute([$codigo]);
if (!$stmt->fetch()) json_error('Baixa não encontrada.', 404);

$pdo->prepare('UPDATE baixas_parceiro SET status = ? WHERE codigo = ?')->execute([$status, $codigo]);

$acao = $status === 'Aprovado' ? 'Aprovou baixa de parceiro' : 'Estornou baixa de parceiro';
registrar_auditoria($pdo, $usuario['id'], $usuario['nome'], $acao, $codigo);

json_response(['ok' => true, 'status' => $status]);
