<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método não permitido.', 405);

function formatar_lead(array $l): array {
    return [
        'id' => $l['codigo'],
        'nome' => $l['nome'],
        'telefone' => $l['telefone'],
        'email' => $l['email'],
        'origem' => $l['origem'],
        'paginaOrigem' => $l['pagina_origem'],
        'mensagem' => $l['mensagem'],
        'consentimentoLGPD' => (bool) $l['consentimento_lgpd'],
        'status' => $l['status'],
        'motivoPerda' => $l['motivo_perda'],
        'clienteId' => $l['cliente_codigo'],
        'recebidoEm' => str_replace(' ', 'T', $l['recebido_em']),
    ];
}

$rows = $pdo->query(
    'SELECT le.*, cl.codigo AS cliente_codigo
     FROM leads le
     LEFT JOIN clientes cl ON cl.id = le.cliente_id
     ORDER BY le.id DESC'
)->fetchAll();

json_response(array_map('formatar_lead', $rows));
