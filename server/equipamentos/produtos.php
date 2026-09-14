<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

function formatar_produto(array $p): array {
    return [
        'id' => $p['codigo'],
        'descricao' => $p['descricao'],
        'categoria' => $p['categoria'],
        'precoCusto' => (float) $p['preco_custo'],
        'precoVenda' => (float) $p['preco_venda'],
        'estoque' => (int) $p['estoque'],
        'estoqueMinimo' => (int) $p['estoque_minimo'],
        'locavel' => (bool) $p['locavel'],
        'foto' => $p['foto'],
    ];
}

if ($method === 'GET') {
    $rows = $pdo->query('SELECT * FROM equipamentos_produto ORDER BY id DESC')->fetchAll();
    json_response(array_map('formatar_produto', $rows));
}

if ($method === 'POST') {
    $body = read_json_body();
    $descricao = trim($body['descricao'] ?? '');
    $categoria = trim($body['categoria'] ?? '');
    if ($descricao === '' || $categoria === '') json_error('Descrição e categoria são obrigatórias.', 400);

    $unidades = $body['unidades'] ?? null;
    $locavel = is_array($unidades) && count($unidades) > 0;
    $precoCusto = isset($body['precoCusto']) ? (float) $body['precoCusto'] : 0;

    if ($locavel) {
        foreach ($unidades as $u) {
            if (trim($u['patrimonio'] ?? '') === '') json_error('Todas as unidades precisam de um nº de inventário.', 400);
        }
    } else {
        $precoVenda = isset($body['precoVenda']) ? (float) $body['precoVenda'] : 0;
        if ($precoVenda <= 0) json_error('Preço de venda é obrigatório.', 400);
    }

    $pdo->beginTransaction();
    try {
        $codigo = gerar_codigo($pdo, 'equipamentos_produto', 'EQP', 4, 1001);

        if ($locavel) {
            $pdo->prepare(
                'INSERT INTO equipamentos_produto (codigo, descricao, categoria, preco_custo, preco_venda, estoque, estoque_minimo, locavel)
                 VALUES (?, ?, ?, ?, 0, ?, 0, 1)'
            )->execute([$codigo, $descricao, $categoria, $precoCusto, count($unidades)]);
            $produtoId = (int) $pdo->lastInsertId();

            $insUnidade = $pdo->prepare(
                'INSERT INTO equipamentos_unidade (patrimonio, produto_id, estado_conservacao, aquisicao) VALUES (?, ?, ?, ?)'
            );
            foreach ($unidades as $u) {
                $insUnidade->execute([
                    trim($u['patrimonio']), $produtoId,
                    $u['estadoConservacao'] ?? 'Ótimo',
                    $u['aquisicao'] ?: date('Y-m-d'),
                ]);
            }
        } else {
            $pdo->prepare(
                'INSERT INTO equipamentos_produto (codigo, descricao, categoria, preco_custo, preco_venda, estoque, estoque_minimo, locavel)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 0)'
            )->execute([
                $codigo, $descricao, $categoria, $precoCusto, $precoVenda,
                isset($body['estoque']) ? (int) $body['estoque'] : 0,
                isset($body['estoqueMinimo']) ? (int) $body['estoqueMinimo'] : 0,
            ]);
        }

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        json_error('Erro ao cadastrar equipamento — verifique se o nº de inventário já não está em uso.', 500);
    }

    json_response(['id' => $codigo], 201);
}

json_error('Método não permitido.', 405);
