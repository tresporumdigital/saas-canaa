<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$usuario = require_auth($pdo);
$codigo = $_GET['id'] ?? '';
if ($codigo === '') json_error('ID inválido.', 400);

$stmt = $pdo->prepare('SELECT * FROM clientes WHERE codigo = ?');
$stmt->execute([$codigo]);
$cliente = $stmt->fetch();
if (!$cliente) json_error('Cliente não encontrado.', 404);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $dep = $pdo->prepare('SELECT nome, cpf, rg, telefone, parentesco, nascimento FROM dependentes WHERE cliente_id = ?');
    $dep->execute([$cliente['id']]);

    $hist = $pdo->prepare(
        'SELECT h.quando, h.oque, u.nome AS quem
         FROM cliente_historico h LEFT JOIN usuarios u ON u.id = h.usuario_id
         WHERE h.cliente_id = ? ORDER BY h.quando DESC'
    );
    $hist->execute([$cliente['id']]);

    json_response([
        'id' => $cliente['codigo'],
        'nome' => $cliente['nome'],
        'cpf' => $cliente['cpf'],
        'rg' => $cliente['rg'],
        'nascimento' => $cliente['nascimento'],
        'telefone' => $cliente['telefone'],
        'email' => $cliente['email'],
        'status' => $cliente['status'],
        'cadastradoEm' => $cliente['cadastrado_em'],
        'endereco' => [
            'logradouro' => $cliente['logradouro'], 'numero' => $cliente['numero'],
            'bairro' => $cliente['bairro'], 'cidade' => $cliente['cidade'],
            'uf' => $cliente['uf'], 'cep' => $cliente['cep'],
        ],
        'dependentes' => $dep->fetchAll(),
        'historico' => $hist->fetchAll(),
    ]);
}

if ($method === 'PUT') {
    $body = read_json_body();
    $endereco = $body['endereco'] ?? [];

    $pdo->prepare(
        'UPDATE clientes SET nome=?, rg=?, nascimento=?, telefone=?, email=?,
            logradouro=?, numero=?, bairro=?, cidade=?, uf=?, cep=? WHERE id=?'
    )->execute([
        trim($body['nome'] ?? $cliente['nome']),
        $body['rg'] ?? $cliente['rg'],
        $body['nascimento'] ?: $cliente['nascimento'],
        only_digits($body['telefone'] ?? '') ?: $cliente['telefone'],
        $body['email'] ?? $cliente['email'],
        $endereco['logradouro'] ?? $cliente['logradouro'],
        $endereco['numero'] ?? $cliente['numero'],
        $endereco['bairro'] ?? $cliente['bairro'],
        $endereco['cidade'] ?? $cliente['cidade'],
        $endereco['uf'] ?? $cliente['uf'],
        $endereco['cep'] ?? $cliente['cep'],
        $cliente['id'],
    ]);

    $pdo->prepare('INSERT INTO cliente_historico (cliente_id, usuario_id, oque) VALUES (?, ?, ?)')
        ->execute([$cliente['id'], $usuario['id'], 'Dados atualizados']);

    json_response(['ok' => true]);
}

json_error('Método não permitido.', 405);
