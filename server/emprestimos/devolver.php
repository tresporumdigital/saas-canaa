<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') json_error('Método não permitido.', 405);

$codigo = $_GET['id'] ?? '';
if ($codigo === '') json_error('Dados inválidos.', 400);
$body = read_json_body();

$stmt = $pdo->prepare('SELECT id, unidade_id, status FROM emprestimos WHERE codigo = ?');
$stmt->execute([$codigo]);
$row = $stmt->fetch();
if (!$row) json_error('Empréstimo não encontrado.', 404);
if ($row['status'] === 'Devolvido') json_error('Este empréstimo já foi devolvido.', 409);

$estadoDevolucao = $body['estadoDevolucao'] ?? null;
if ($estadoDevolucao !== null && !in_array($estadoDevolucao, ['Ótimo', 'Bom', 'Regular'], true)) {
    json_error('Estado de conservação inválido.', 400);
}

$pdo->beginTransaction();
try {
    $pdo->prepare('UPDATE emprestimos SET status = \'Devolvido\', devolucao_em = NOW(), estado_devolucao = ? WHERE id = ?')
        ->execute([$estadoDevolucao, $row['id']]);

    $pdo->prepare('UPDATE equipamentos_unidade SET status = \'Disponível\' WHERE id = ?')
        ->execute([$row['unidade_id']]);

    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    json_error('Erro ao registrar a devolução.', 500);
}

json_response(['ok' => true]);
