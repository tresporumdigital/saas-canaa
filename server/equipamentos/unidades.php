<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método não permitido.', 405);

$sql = 'SELECT u.*, p.codigo AS produto_codigo, p.descricao AS produto_descricao, p.foto AS produto_foto
        FROM equipamentos_unidade u
        JOIN equipamentos_produto p ON p.id = u.produto_id
        WHERE 1=1';
$params = [];
if (!empty($_GET['status'])) { $sql .= ' AND u.status = ?'; $params[] = $_GET['status']; }
if (!empty($_GET['produtoId'])) { $sql .= ' AND p.codigo = ?'; $params[] = $_GET['produtoId']; }
$sql .= ' ORDER BY u.id DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);

json_response(array_map(function (array $u): array {
    return [
        'id' => $u['patrimonio'],
        'patrimonio' => $u['patrimonio'],
        'produtoId' => $u['produto_codigo'],
        'descricao' => $u['produto_descricao'],
        'foto' => $u['produto_foto'],
        'status' => $u['status'],
        'estadoConservacao' => $u['estado_conservacao'],
        'aquisicao' => $u['aquisicao'],
    ];
}, $stmt->fetchAll()));
