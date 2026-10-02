<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

// O catálogo de Cadastros guarda equipamentos, produtos e serviços na mesma tabela.
// A coluna `tipo` entrou depois da criação da tabela em produção — garante que ela existe
// (idempotente; os registros antigos ficam como "Equipamento").
if (!$pdo->query("SHOW COLUMNS FROM equipamentos_produto LIKE 'tipo'")->fetch()) {
    $pdo->exec("ALTER TABLE equipamentos_produto ADD COLUMN tipo ENUM('Equipamento','Produto','Serviço') NOT NULL DEFAULT 'Equipamento' AFTER codigo");
}
const TIPOS_CADASTRO = ['Equipamento', 'Produto', 'Serviço'];

function formatar_produto(array $p): array {
    return [
        'id' => $p['codigo'],
        'tipo' => $p['tipo'] ?? 'Equipamento',
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
    $tipo = $body['tipo'] ?? 'Equipamento';
    if (!in_array($tipo, TIPOS_CADASTRO, true)) json_error('Tipo de cadastro inválido.', 400);

    $unidades = $body['unidades'] ?? null;
    $locavel = is_array($unidades) && count($unidades) > 0;
    // Só equipamento tem nº de inventário para locação; produto e serviço são sempre de venda.
    if ($locavel && $tipo !== 'Equipamento') json_error('Apenas equipamentos podem ser cadastrados para locação.', 400);
    $ehServico = $tipo === 'Serviço';
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
                'INSERT INTO equipamentos_produto (codigo, tipo, descricao, categoria, preco_custo, preco_venda, estoque, estoque_minimo, locavel)
                 VALUES (?, ?, ?, ?, ?, 0, ?, 0, 1)'
            )->execute([$codigo, $tipo, $descricao, $categoria, $precoCusto, count($unidades)]);
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
                'INSERT INTO equipamentos_produto (codigo, tipo, descricao, categoria, preco_custo, preco_venda, estoque, estoque_minimo, locavel)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)'
            )->execute([
                $codigo, $tipo, $descricao, $categoria, $precoCusto, $precoVenda,
                // Serviço não tem estoque.
                !$ehServico && isset($body['estoque']) ? (int) $body['estoque'] : 0,
                !$ehServico && isset($body['estoqueMinimo']) ? (int) $body['estoqueMinimo'] : 0,
            ]);
        }

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        json_error('Erro ao salvar o cadastro — verifique se o nº de inventário já não está em uso.', 500);
    }

    json_response(['id' => $codigo], 201);
}

json_error('Método não permitido.', 405);
