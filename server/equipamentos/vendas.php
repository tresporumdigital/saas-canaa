<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$usuario = require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $vendas = $pdo->query(
        'SELECT v.*, c.codigo AS cliente_codigo, u.nome AS vendedor_nome
         FROM vendas_equipamento v
         LEFT JOIN clientes c ON c.id = v.cliente_id
         LEFT JOIN usuarios u ON u.id = v.vendedor_usuario_id
         ORDER BY v.id DESC'
    )->fetchAll();

    $itens = $pdo->query('SELECT venda_id, descricao, qtd, valor_unit FROM venda_itens ORDER BY id')->fetchAll();
    $itensPorVenda = [];
    foreach ($itens as $it) {
        $itensPorVenda[$it['venda_id']][] = [
            'descricao' => $it['descricao'], 'qtd' => (int) $it['qtd'], 'valorUnit' => (float) $it['valor_unit'],
        ];
    }

    $out = array_map(function (array $v) use ($itensPorVenda): array {
        return [
            'id' => $v['codigo'],
            'data' => $v['data'],
            'clienteId' => $v['cliente_codigo'],
            'clienteNome' => $v['comprador_nome'],
            'vendedor' => $v['vendedor_nome'] ?? 'Balcão',
            'formaPagamento' => $v['forma_pagamento'],
            'itens' => $itensPorVenda[$v['id']] ?? [],
            'desconto' => (float) $v['desconto'],
            'custo' => (float) $v['custo'],
            'notaFiscalId' => $v['nota_fiscal_id'],
            'parcelas' => $v['parcelas'] !== null ? (int) $v['parcelas'] : null,
        ];
    }, $vendas);

    json_response($out);
}

if ($method === 'POST') {
    $body = read_json_body();
    $produtoCodigo = $body['produtoId'] ?? '';
    $compradorNome = trim($body['comprador']['nome'] ?? '');
    $compradorCpf = only_digits($body['comprador']['cpf'] ?? '');
    $compradorTelefone = only_digits($body['comprador']['telefone'] ?? '');
    $formaPagamento = trim($body['formaPagamento'] ?? '');
    $valorUnit = isset($body['valor']) ? (float) $body['valor'] : 0;
    $qtd = isset($body['qtd']) ? (int) $body['qtd'] : 1;

    if ($produtoCodigo === '' || $compradorNome === '' || strlen($compradorCpf) !== 11
        || strlen($compradorTelefone) < 10 || $formaPagamento === '' || $valorUnit <= 0) {
        json_error('Dados da venda incompletos.', 400);
    }

    $produto = $pdo->prepare('SELECT id, descricao, preco_custo, estoque FROM equipamentos_produto WHERE codigo = ?');
    $produto->execute([$produtoCodigo]);
    $produtoRow = $produto->fetch();
    if (!$produtoRow) json_error('Equipamento não encontrado.', 404);

    $clienteId = null;
    if (!empty($body['clienteId'])) {
        $cliente = $pdo->prepare('SELECT id FROM clientes WHERE codigo = ?');
        $cliente->execute([$body['clienteId']]);
        $clienteId = $cliente->fetchColumn() ?: null;
    }

    $endereco = $body['endereco'] ?? [];
    $desconto = isset($body['desconto']) ? (float) $body['desconto'] : 0;
    $custo = $produtoRow['preco_custo'] * $qtd;

    $pdo->beginTransaction();
    try {
        $codigo = gerar_codigo($pdo, 'vendas_equipamento', 'VEQ-2026', 4, 1001);
        $pdo->prepare(
            'INSERT INTO vendas_equipamento (codigo, cliente_id, comprador_nome, comprador_cpf, comprador_telefone,
                endereco_cep, endereco_logradouro, endereco_numero, endereco_bairro, endereco_cidade, endereco_uf,
                vendedor_usuario_id, forma_pagamento, desconto, custo, parcelas)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        )->execute([
            $codigo, $clienteId, $compradorNome, $compradorCpf, $compradorTelefone,
            $endereco['cep'] ?? null, $endereco['logradouro'] ?? null, $endereco['numero'] ?? null,
            $endereco['bairro'] ?? null, $endereco['cidade'] ?? null, $endereco['uf'] ?? null,
            $usuario['id'], $formaPagamento, $desconto, $custo,
            isset($body['parcelas']) ? (int) $body['parcelas'] : null,
        ]);
        $vendaId = (int) $pdo->lastInsertId();

        $pdo->prepare('INSERT INTO venda_itens (venda_id, produto_id, descricao, qtd, valor_unit) VALUES (?, ?, ?, ?, ?)')
            ->execute([$vendaId, $produtoRow['id'], $produtoRow['descricao'], $qtd, $valorUnit]);

        $pdo->prepare('UPDATE equipamentos_produto SET estoque = GREATEST(0, estoque - ?) WHERE id = ?')
            ->execute([$qtd, $produtoRow['id']]);

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        json_error('Erro ao registrar a venda.', 500);
    }

    json_response(['id' => $codigo], 201);
}

json_error('Método não permitido.', 405);
