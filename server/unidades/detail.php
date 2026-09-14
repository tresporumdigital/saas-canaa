<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
$codigo = $_GET['id'] ?? '';
if ($codigo === '') json_error('ID inválido.', 400);

$stmt = $pdo->prepare('SELECT * FROM unidades WHERE codigo = ?');
$stmt->execute([$codigo]);
$unidade = $stmt->fetch();
if (!$unidade) json_error('Unidade não encontrada.', 404);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    json_response([
        'id' => $unidade['codigo'], 'nome' => $unidade['nome'], 'tipo' => $unidade['tipo'],
        'cnpj' => $unidade['cnpj'], 'responsavel' => $unidade['responsavel'],
        'telefone' => $unidade['telefone'], 'email' => $unidade['email'],
        'cidade' => $unidade['cidade'], 'uf' => $unidade['uf'], 'status' => $unidade['status'],
        'horario' => $unidade['horario'], 'alvara' => $unidade['alvara'],
        'salasVelorio' => (int) $unidade['salas_velorio'], 'capela' => (bool) $unidade['capela'],
        'foto' => $unidade['foto'],
        'endereco' => [
            'logradouro' => $unidade['logradouro'], 'numero' => $unidade['numero'], 'bairro' => $unidade['bairro'],
            'cidade' => $unidade['cidade'], 'uf' => $unidade['uf'], 'cep' => $unidade['cep'],
        ],
    ]);
}

if ($method === 'PUT') {
    $body = read_json_body();
    $endereco = $body['endereco'] ?? [];

    $pdo->prepare(
        'UPDATE unidades SET nome=?, tipo=?, cnpj=?, status=?, responsavel=?, telefone=?, email=?,
            horario=?, alvara=?, salas_velorio=?, capela=?, foto=?,
            logradouro=?, numero=?, bairro=?, cidade=?, uf=?, cep=? WHERE id=?'
    )->execute([
        trim($body['nome'] ?? $unidade['nome']),
        $body['tipo'] ?? $unidade['tipo'],
        $body['cnpj'] ? only_digits($body['cnpj']) : $unidade['cnpj'],
        $body['status'] ?? $unidade['status'],
        $body['responsavel'] ?? $unidade['responsavel'],
        isset($body['telefone']) ? only_digits($body['telefone']) : $unidade['telefone'],
        $body['email'] ?? $unidade['email'],
        $body['horario'] ?? $unidade['horario'],
        $body['alvara'] ?? $unidade['alvara'],
        isset($body['salasVelorio']) ? (int) $body['salasVelorio'] : $unidade['salas_velorio'],
        isset($body['capela']) ? (!empty($body['capela']) ? 1 : 0) : $unidade['capela'],
        $body['foto'] ?? $unidade['foto'],
        $endereco['logradouro'] ?? $unidade['logradouro'],
        $endereco['numero'] ?? $unidade['numero'],
        $endereco['bairro'] ?? $unidade['bairro'],
        $endereco['cidade'] ?? $unidade['cidade'],
        $endereco['uf'] ?? $unidade['uf'],
        $endereco['cep'] ?? $unidade['cep'],
        $unidade['id'],
    ]);

    json_response(['ok' => true]);
}

json_error('Método não permitido.', 405);
