<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$usuario = require_auth($pdo);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Método não permitido.', 405);

$body = read_json_body();
$competencia = $body['competenciaInicial'] ?? '';
$parcelas = isset($body['parcelas']) ? (int) $body['parcelas'] : 0;
$planoCodigo = trim($body['planoId'] ?? '');

if ($competencia === '' || !in_array($parcelas, [3, 6, 12], true)) {
    json_error('Dados do lote incompletos.', 400);
}

$sql = "SELECT ct.id, cl.nome AS cliente_nome, pp.valor_mensal
        FROM contratos ct
        JOIN clientes cl ON cl.id = ct.cliente_id
        JOIN planos_produto pp ON pp.id = ct.plano_id
        WHERE ct.situacao IN ('Ativo', 'Em atraso')";
$params = [];
if ($planoCodigo !== '') { $sql .= ' AND pp.codigo = ?'; $params[] = $planoCodigo; }

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$contratos = $stmt->fetchAll();

if (count($contratos) === 0) json_error('Nenhum contrato ativo encontrado para o filtro.', 404);

$lote = 'LOTE-' . date('Ymd-His');

$pdo->beginTransaction();
try {
    $ins = $pdo->prepare(
        'INSERT INTO carnes (codigo, contrato_id, cliente_nome, competencia_inicial, parcelas,
            valor_parcela, lote, criado_por_usuario_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    foreach ($contratos as $c) {
        $codigo = gerar_codigo($pdo, 'carnes', 'CAR-2026', 4, 1001);
        $ins->execute([
            $codigo, $c['id'], $c['cliente_nome'], $competencia . '-01',
            $parcelas, $c['valor_mensal'], $lote, $usuario['id'],
        ]);
    }
    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    json_error('Erro ao gerar os carnês em lote.', 500);
}

json_response(['lote' => $lote, 'total' => count($contratos)], 201);
