<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$usuario = require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

function formatar_emprestimo(array $e): array {
    return [
        'id' => $e['codigo'],
        'unidadePatrimonio' => $e['patrimonio'],
        'produtoDescricao' => $e['produto_descricao'],
        'produtoFoto' => $e['produto_foto'],
        'clienteId' => $e['cliente_codigo'],
        'clienteNome' => $e['cliente_nome'],
        'saidaEm' => $e['saida_em'],
        'previsaoDevolucao' => $e['previsao_devolucao'],
        'devolucaoEm' => $e['devolucao_em'],
        'responsavelRetirada' => $e['responsavel_retirada'],
        'estadoSaida' => $e['estado_saida'],
        'estadoDevolucao' => $e['estado_devolucao'],
        'observacoes' => $e['observacoes'],
        'vinculo' => [
            'tipo' => $e['vinculo_tipo'],
            'contratoId' => $e['contrato_codigo'],
            'valorLocacao' => (float) $e['valor_locacao'],
        ],
        'status' => $e['status'],
    ];
}

if ($method === 'GET') {
    $sql = 'SELECT emp.*, un.patrimonio, pr.descricao AS produto_descricao, pr.foto AS produto_foto,
                cl.codigo AS cliente_codigo, cl.nome AS cliente_nome, ct.codigo AS contrato_codigo
            FROM emprestimos emp
            JOIN equipamentos_unidade un ON un.id = emp.unidade_id
            JOIN equipamentos_produto pr ON pr.id = un.produto_id
            JOIN clientes cl ON cl.id = emp.cliente_id
            LEFT JOIN contratos ct ON ct.id = emp.contrato_id
            WHERE 1=1';
    $params = [];
    if (!empty($_GET['clienteId'])) { $sql .= ' AND cl.codigo = ?'; $params[] = $_GET['clienteId']; }
    if (!empty($_GET['unidadePatrimonio'])) { $sql .= ' AND un.patrimonio = ?'; $params[] = $_GET['unidadePatrimonio']; }
    $sql .= ' ORDER BY emp.id DESC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    json_response(array_map('formatar_emprestimo', $stmt->fetchAll()));
}

if ($method === 'POST') {
    $body = read_json_body();
    $unidadePatrimonio = trim($body['unidadePatrimonio'] ?? '');
    $clienteCodigo = trim($body['clienteId'] ?? '');
    $responsavel = trim($body['responsavel'] ?? '');
    $previsao = $body['previsaoDevolucao'] ?? '';
    $vinculoTipo = $body['vinculo'] ?? '';
    $estadoSaida = $body['estadoSaida'] ?? 'Bom';

    if ($unidadePatrimonio === '' || $clienteCodigo === '' || $responsavel === '' || $previsao === ''
        || !in_array($vinculoTipo, ['Cobertura de plano', 'Locação'], true)) {
        json_error('Dados da saída incompletos.', 400);
    }

    $unidade = $pdo->prepare('SELECT id, status FROM equipamentos_unidade WHERE patrimonio = ?');
    $unidade->execute([$unidadePatrimonio]);
    $unidadeRow = $unidade->fetch();
    if (!$unidadeRow) json_error('Unidade não encontrada.', 404);
    if ($unidadeRow['status'] !== 'Disponível') json_error('Esta unidade não está disponível.', 409);

    $cliente = $pdo->prepare('SELECT id FROM clientes WHERE codigo = ?');
    $cliente->execute([$clienteCodigo]);
    $clienteId = $cliente->fetchColumn();
    if (!$clienteId) json_error('Cliente não encontrado.', 404);

    $pdo->beginTransaction();
    try {
        $codigo = gerar_codigo($pdo, 'emprestimos', 'EMP-2026', 4, 1001);
        $pdo->prepare(
            'INSERT INTO emprestimos (codigo, unidade_id, cliente_id, responsavel_retirada, previsao_devolucao,
                estado_saida, vinculo_tipo, observacoes, criado_por_usuario_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        )->execute([
            $codigo, $unidadeRow['id'], $clienteId, $responsavel, $previsao,
            $estadoSaida, $vinculoTipo, trim($body['observacoes'] ?? '') ?: null, $usuario['id'],
        ]);

        $pdo->prepare('UPDATE equipamentos_unidade SET status = \'Emprestado\' WHERE id = ?')
            ->execute([$unidadeRow['id']]);

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        json_error('Erro ao registrar a saída.', 500);
    }

    json_response(['id' => $codigo], 201);
}

json_error('Método não permitido.', 405);
