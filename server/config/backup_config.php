<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método não permitido.', 405);

$row = $pdo->query('SELECT * FROM backup_config WHERE id = 1')->fetch();
if (!$row) json_response(null);

json_response([
    'destino' => $row['destino'],
    'retencao' => [
        'diarios' => (int) $row['retencao_diarios'],
        'semanais' => (int) $row['retencao_semanais'],
        'mensais' => (int) $row['retencao_mensais'],
    ],
    'janela' => $row['janela'],
    'rpo' => $row['rpo'],
    'rto' => $row['rto'],
    'ultimoTesteRestauracao' => $row['ultimo_teste_restauracao'],
]);
