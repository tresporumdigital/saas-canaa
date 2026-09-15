<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$usuario = require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

function formatar_carne(array $c): array {
    return [
        'id' => $c['codigo'],
        'contratoId' => $c['contrato_codigo'],
        'clienteNome' => $c['cliente_nome'],
        'competenciaInicial' => formatar_competencia($c['competencia_inicial']),
        'parcelas' => (int) $c['parcelas'],
        'valorParcela' => (float) $c['valor_parcela'],
        'geradoEm' => $c['gerado_em'],
        'enviadoEm' => $c['enviado_em'],
        'canalEnvio' => $c['canal_envio'],
        'lote' => $c['lote'],
    ];
}

if ($method === 'GET') {
    $rows = $pdo->query(
        'SELECT c.*, ct.codigo AS contrato_codigo
         FROM carnes c
         JOIN contratos ct ON ct.id = c.contrato_id
         ORDER BY c.id DESC'
    )->fetchAll();
    json_response(array_map('formatar_carne', $rows));
}

if ($method === 'POST') {
    $body = read_json_body();
    $contratoCodigo = $body['contratoId'] ?? '';
    $competencia = $body['competenciaInicial'] ?? '';
    $parcelas = isset($body['parcelas']) ? (int) $body['parcelas'] : 0;

    if ($contratoCodigo === '' || $competencia === '' || !in_array($parcelas, [3, 6, 12], true)) {
        json_error('Dados do carnê incompletos.', 400);
    }

    $contrato = $pdo->prepare(
        'SELECT ct.id, cl.nome AS cliente_nome, pp.valor_mensal
         FROM contratos ct
         JOIN clientes cl ON cl.id = ct.cliente_id
         JOIN planos_produto pp ON pp.id = ct.plano_id
         WHERE ct.codigo = ?'
    );
    $contrato->execute([$contratoCodigo]);
    $contratoRow = $contrato->fetch();
    if (!$contratoRow) json_error('Contrato não encontrado.', 404);

    $pdo->beginTransaction();
    try {
        $codigo = gerar_codigo($pdo, 'carnes', 'CAR-2026', 4, 1001);
        $pdo->prepare(
            'INSERT INTO carnes (codigo, contrato_id, cliente_nome, competencia_inicial, parcelas,
                valor_parcela, criado_por_usuario_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        )->execute([
            $codigo, $contratoRow['id'], $contratoRow['cliente_nome'], $competencia . '-01',
            $parcelas, $contratoRow['valor_mensal'], $usuario['id'],
        ]);

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        json_error('Erro ao gerar o carnê.', 500);
    }

    json_response(['id' => $codigo], 201);
}

json_error('Método não permitido.', 405);
