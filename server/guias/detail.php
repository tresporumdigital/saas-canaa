<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método não permitido.', 405);

$codigo = $_GET['id'] ?? '';
if ($codigo === '') json_error('ID inválido.', 400);

$stmt = $pdo->prepare(
    'SELECT g.*, ob.codigo AS obito_codigo, pa.codigo AS parceiro_codigo, u.nome AS emitida_por_nome
     FROM guias g
     LEFT JOIN obitos ob ON ob.id = g.obito_id
     JOIN parceiros pa ON pa.id = g.parceiro_id
     LEFT JOIN usuarios u ON u.id = g.emitida_por_usuario_id
     WHERE g.codigo = ?'
);
$stmt->execute([$codigo]);
$g = $stmt->fetch();
if (!$g) json_error('Guia não encontrada.', 404);

$hist = $pdo->prepare('SELECT status, quando, quem FROM guia_historico WHERE guia_id = ? ORDER BY id ASC');
$hist->execute([$g['id']]);

json_response([
    'id' => $g['codigo'],
    'obitoId' => $g['obito_codigo'],
    'clienteNome' => $g['cliente_nome_snapshot'],
    'clienteVinculo' => $g['cliente_vinculo_snapshot'],
    'parceiroId' => $g['parceiro_codigo'],
    'servico' => $g['servico'],
    'valorAcordado' => (float) $g['valor_acordado'],
    'emitidaEm' => $g['emitida_em'],
    'emitidaPor' => $g['emitida_por_nome'],
    'status' => $g['status'],
    'coberto' => (bool) $g['coberto'],
    'canceladaJustificativa' => $g['cancelada_justificativa'],
    'pdfNumero' => str_replace('GA-', '', $g['codigo']),
    'historico' => $hist->fetchAll(),
]);
