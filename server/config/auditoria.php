<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método não permitido.', 405);

function formatar_auditoria(array $a): array {
    return [
        'id' => (string) $a['id'],
        'quando' => str_replace(' ', 'T', $a['quando']),
        'usuario' => $a['usuario_nome'],
        'acao' => $a['acao'],
        'entidade' => $a['entidade'],
        'ip' => $a['ip'],
    ];
}

$rows = $pdo->query('SELECT * FROM auditoria ORDER BY id DESC LIMIT 500')->fetchAll();
json_response(array_map('formatar_auditoria', $rows));
