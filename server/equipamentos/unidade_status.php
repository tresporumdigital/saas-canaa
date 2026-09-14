<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') json_error('Método não permitido.', 405);

$patrimonio = $_GET['patrimonio'] ?? '';
$body = read_json_body();
$status = $body['status'] ?? '';
if ($patrimonio === '' || !in_array($status, ['Disponível', 'Emprestado', 'Em manutenção', 'Baixado'], true)) {
    json_error('Dados inválidos.', 400);
}

$stmt = $pdo->prepare('SELECT id FROM equipamentos_unidade WHERE patrimonio = ?');
$stmt->execute([$patrimonio]);
if (!$stmt->fetch()) json_error('Unidade não encontrada.', 404);

$pdo->prepare('UPDATE equipamentos_unidade SET status = ? WHERE patrimonio = ?')->execute([$status, $patrimonio]);

json_response(['ok' => true, 'status' => $status]);
