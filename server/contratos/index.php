<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $rows = $pdo->query(
        'SELECT c.*, cl.codigo AS cliente_codigo, p.codigo AS plano_codigo, u.nome AS vendedor_nome,
            (SELECT COUNT(*) FROM contrato_parcelas pc
             WHERE pc.contrato_id = c.id AND pc.status = \'Em aberto\') AS parcelas_em_aberto
         FROM contratos c
         JOIN clientes cl ON cl.id = c.cliente_id
         JOIN planos_produto p ON p.id = c.plano_id
         LEFT JOIN usuarios u ON u.id = c.vendedor_usuario_id
         ORDER BY c.id DESC'
    )->fetchAll();

    $out = array_map(function ($c) {
        return [
            'id' => $c['codigo'],
            'clienteId' => $c['cliente_codigo'],
            'planoId' => $c['plano_codigo'],
            'inicio' => $c['inicio'],
            'diaVencimento' => (int) $c['dia_vencimento'],
            'formaPagamento' => $c['forma_pagamento'],
            'vendedor' => $c['vendedor_nome'],
            'situacao' => $c['situacao'],
            'parcelasEmAberto' => (int) $c['parcelas_em_aberto'],
            'canceladoEm' => $c['cancelado_em'],
            'motivoCancelamento' => $c['motivo_cancelamento'],
            'criadoEm' => $c['criado_em'],
        ];
    }, $rows);

    json_response($out);
}

if ($method === 'POST') {
    $body = read_json_body();

    $clienteCodigo = $body['clienteId'] ?? '';
    $planoCodigo = $body['planoId'] ?? '';
    $inicio = $body['inicio'] ?? '';
    $diaVencimento = (int) ($body['diaVencimento'] ?? 0);
    $formaPagamento = $body['formaPagamento'] ?? '';

    if ($clienteCodigo === '' || $planoCodigo === '' || $inicio === '' || $diaVencimento <= 0) {
        json_error('Cliente, plano, início e dia de vencimento são obrigatórios.', 400);
    }
    if (!in_array($formaPagamento, ['Boleto', 'Pix', 'Cartão recorrente'], true)) {
        json_error('Forma de pagamento inválida.', 400);
    }

    $cliente = $pdo->prepare('SELECT id FROM clientes WHERE codigo = ?');
    $cliente->execute([$clienteCodigo]);
    $clienteId = $cliente->fetchColumn();
    if (!$clienteId) json_error('Cliente não encontrado.', 404);

    $plano = $pdo->prepare('SELECT id, valor_mensal FROM planos_produto WHERE codigo = ?');
    $plano->execute([$planoCodigo]);
    $planoRow = $plano->fetch();
    if (!$planoRow) json_error('Plano não encontrado.', 404);

    $vendedorId = null;
    if (!empty($body['vendedorUsuarioId'])) {
        $v = $pdo->prepare('SELECT id FROM usuarios WHERE codigo = ?');
        $v->execute([$body['vendedorUsuarioId']]);
        $vendedorId = $v->fetchColumn() ?: null;
    }

    $pdo->beginTransaction();
    try {
        $codigo = gerar_codigo($pdo, 'contratos', 'CTR-2026', 4, 1001);
        $pdo->prepare(
            'INSERT INTO contratos (codigo, cliente_id, plano_id, inicio, dia_vencimento, forma_pagamento, vendedor_usuario_id, situacao)
             VALUES (?, ?, ?, ?, ?, ?, ?, \'Ativo\')'
        )->execute([$codigo, $clienteId, $planoRow['id'], $inicio, $diaVencimento, $formaPagamento, $vendedorId]);
        $contratoId = (int) $pdo->lastInsertId();

        // Gera as 12 parcelas mensais recorrentes a partir do mês de início.
        [$ano, $mes] = array_map('intval', explode('-', substr($inicio, 0, 7)));
        $insertParcela = $pdo->prepare(
            'INSERT INTO contrato_parcelas (contrato_id, numero, competencia, vencimento, valor) VALUES (?, ?, ?, ?, ?)'
        );
        for ($i = 0; $i < 12; $i++) {
            $mesAtual = $mes + $i;
            $anoAtual = $ano + intdiv($mesAtual - 1, 12);
            $mesAtual = (($mesAtual - 1) % 12) + 1;
            $competencia = sprintf('%04d-%02d-01', $anoAtual, $mesAtual);
            $ultimoDiaDoMes = (int) date('t', strtotime($competencia));
            $diaVencReal = min($diaVencimento, $ultimoDiaDoMes);
            $vencimento = sprintf('%04d-%02d-%02d', $anoAtual, $mesAtual, $diaVencReal);
            $insertParcela->execute([$contratoId, $i + 1, $competencia, $vencimento, $planoRow['valor_mensal']]);
        }

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        json_error('Erro ao criar contrato.', 500);
    }

    json_response(['id' => $codigo], 201);
}

json_error('Método não permitido.', 405);
