<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$usuario = require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

function formatar_cliente(array $c): array {
    return [
        'id' => $c['codigo'],
        'nome' => $c['nome'],
        'cpf' => $c['cpf'],
        'rg' => $c['rg'],
        'nascimento' => $c['nascimento'],
        'telefone' => $c['telefone'],
        'email' => $c['email'],
        'status' => $c['status'],
        'cadastradoEm' => $c['cadastrado_em'],
        'endereco' => [
            'logradouro' => $c['logradouro'],
            'numero' => $c['numero'],
            'bairro' => $c['bairro'],
            'cidade' => $c['cidade'],
            'uf' => $c['uf'],
            'cep' => $c['cep'],
        ],
    ];
}

if ($method === 'GET') {
    $clientes = $pdo->query('SELECT * FROM clientes ORDER BY id DESC')->fetchAll();

    $deps = $pdo->query('SELECT codigo, cliente_id, nome, cpf, rg, telefone, parentesco, nascimento FROM dependentes')->fetchAll();
    $depsPorCliente = [];
    foreach ($deps as $d) {
        $depsPorCliente[$d['cliente_id']][] = [
            'id' => $d['codigo'], 'nome' => $d['nome'], 'cpf' => $d['cpf'], 'rg' => $d['rg'],
            'telefone' => $d['telefone'], 'parentesco' => $d['parentesco'], 'nascimento' => $d['nascimento'],
        ];
    }

    $out = [];
    foreach ($clientes as $c) {
        $row = formatar_cliente($c);
        $row['dependentes'] = $depsPorCliente[$c['id']] ?? [];
        $out[] = $row;
    }
    json_response($out);
}

if ($method === 'POST') {
    $body = read_json_body();
    $nome = trim($body['nome'] ?? '');
    $cpf = only_digits($body['cpf'] ?? '');
    if ($nome === '' || strlen($cpf) !== 11) json_error('Nome e CPF válidos são obrigatórios.', 400);

    $existe = $pdo->prepare('SELECT id FROM clientes WHERE cpf = ?');
    $existe->execute([$cpf]);
    if ($existe->fetch()) json_error('Já existe um cliente cadastrado com esse CPF.', 409);

    $endereco = $body['endereco'] ?? [];

    $pdo->beginTransaction();
    try {
        $codigo = gerar_codigo($pdo, 'clientes', 'CLI', 4, 1001);
        $pdo->prepare(
            'INSERT INTO clientes (codigo, nome, cpf, rg, nascimento, telefone, email, status,
                logradouro, numero, bairro, cidade, uf, cep, cadastrado_em)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())'
        )->execute([
            $codigo, $nome, $cpf,
            $body['rg'] ?? null,
            $body['nascimento'] ?: null,
            only_digits($body['telefone'] ?? '') ?: null,
            $body['email'] ?? null,
            $body['status'] ?? 'Ativo',
            $endereco['logradouro'] ?? null, $endereco['numero'] ?? null, $endereco['bairro'] ?? null,
            $endereco['cidade'] ?? null, $endereco['uf'] ?? null, $endereco['cep'] ?? null,
        ]);
        $clienteId = (int) $pdo->lastInsertId();

        foreach (($body['dependentes'] ?? []) as $dep) {
            $depNome = trim($dep['nome'] ?? '');
            if ($depNome === '') continue;
            $depCodigo = gerar_codigo($pdo, 'dependentes', 'DEP', 4);
            $pdo->prepare(
                'INSERT INTO dependentes (codigo, cliente_id, nome, cpf, rg, telefone, parentesco, nascimento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            )->execute([
                $depCodigo, $clienteId, $depNome,
                only_digits($dep['cpf'] ?? '') ?: null,
                $dep['rg'] ?? null,
                only_digits($dep['telefone'] ?? '') ?: null,
                $dep['parentesco'] ?? null,
                $dep['nascimento'] ?: null,
            ]);
        }

        $pdo->prepare('INSERT INTO cliente_historico (cliente_id, usuario_id, oque) VALUES (?, ?, ?)')
            ->execute([$clienteId, $usuario['id'], 'Cadastro criado']);

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        json_error('Erro ao criar cliente.', 500);
    }

    json_response(['id' => $codigo], 201);
}

json_error('Método não permitido.', 405);
