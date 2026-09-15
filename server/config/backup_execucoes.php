<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método não permitido.', 405);

$rows = $pdo->query('SELECT * FROM backup_execucoes ORDER BY quando DESC')->fetchAll();

json_response(array_map(function (array $r): array {
    return [
        'id' => $r['codigo'],
        'quando' => $r['quando'],
        'tipo' => $r['tipo'],
        'status' => $r['status'],
        'tamanho' => $r['tamanho'],
        'duracao' => $r['duracao'],
        'mensagem' => $r['mensagem'],
    ];
}, $rows));
