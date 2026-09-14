<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método não permitido.', 405);

$codigo = $_GET['id'] ?? '';
if ($codigo === '') json_error('ID inválido.', 400);

$stmt = $pdo->prepare(
    'SELECT o.*, u.nome AS responsavel_nome, cl.codigo AS cliente_codigo, ct.codigo AS contrato_codigo,
        d.nome AS dependente_nome
     FROM obitos o
     LEFT JOIN usuarios u ON u.id = o.responsavel_usuario_id
     LEFT JOIN clientes cl ON cl.id = o.cliente_id
     LEFT JOIN contratos ct ON ct.id = o.contrato_id
     LEFT JOIN dependentes d ON d.id = o.dependente_id
     WHERE o.codigo = ?'
);
$stmt->execute([$codigo]);
$o = $stmt->fetch();
if (!$o) json_error('Atendimento não encontrado.', 404);

$servicosStmt = $pdo->prepare('SELECT nome, coberto, valor FROM obito_servicos WHERE obito_id = ?');
$servicosStmt->execute([$o['id']]);
$servicos = array_map(fn($s) => ['nome' => $s['nome'], 'coberto' => (bool) $s['coberto'], 'valor' => (float) $s['valor']], $servicosStmt->fetchAll());

$cobertura = $o['vinculo_tipo'] === 'Particular' ? null : [
    'planoAtivo' => (bool) $o['cobertura_plano_ativo'],
    'carenciaCumprida' => (bool) $o['cobertura_carencia_cumprida'],
    'dependenteIncluido' => (bool) $o['cobertura_dependente_incluido'],
    'adimplente' => (bool) $o['cobertura_adimplente'],
];

json_response([
    'id' => $o['codigo'],
    'status' => $o['status'],
    'abertoEm' => $o['aberto_em'],
    'responsavel' => $o['responsavel_nome'],
    'falecido' => [
        'nome' => $o['falecido_nome'], 'cpf' => $o['falecido_cpf'],
        'nascimento' => $o['falecido_nascimento'], 'obitoEm' => $o['falecido_obito_em'],
        'localObito' => $o['falecido_local_obito'], 'causaDeclarada' => $o['falecido_causa_declarada'],
        'numeroDO' => $o['falecido_numero_do'], 'cartorio' => $o['falecido_cartorio'],
    ],
    'vinculo' => [
        'tipo' => $o['vinculo_tipo'], 'clienteId' => $o['cliente_codigo'], 'contratoId' => $o['contrato_codigo'],
        'dependenteNome' => $o['dependente_nome'],
    ],
    'solicitante' => [
        'nome' => $o['solicitante_nome'], 'parentesco' => $o['solicitante_parentesco'], 'telefone' => $o['solicitante_telefone'],
    ],
    'locais' => ['velorio' => $o['local_velorio'], 'sepultamento' => $o['local_sepultamento']],
    'cobertura' => $cobertura,
    'servicos' => $servicos,
    'valorTotal' => (float) $o['valor_total'],
]);
