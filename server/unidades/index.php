<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

function formatar_unidade(array $u): array {
    return [
        'id' => $u['codigo'],
        'nome' => $u['nome'],
        'tipo' => $u['tipo'],
        'cnpj' => $u['cnpj'],
        'responsavel' => $u['responsavel'],
        'telefone' => $u['telefone'],
        'email' => $u['email'],
        'cidade' => $u['cidade'],
        'uf' => $u['uf'],
        'status' => $u['status'],
        'horario' => $u['horario'],
        'alvara' => $u['alvara'],
        'salasVelorio' => (int) $u['salas_velorio'],
        'capela' => (bool) $u['capela'],
        'foto' => $u['foto'],
        'endereco' => [
            'logradouro' => $u['logradouro'], 'numero' => $u['numero'], 'bairro' => $u['bairro'],
            'cidade' => $u['cidade'], 'uf' => $u['uf'], 'cep' => $u['cep'],
        ],
    ];
}

if ($method === 'GET') {
    $unidades = $pdo->query('SELECT * FROM unidades ORDER BY id ASC')->fetchAll();
    json_response(array_map('formatar_unidade', $unidades));
}

if ($method === 'POST') {
    $body = read_json_body();
    $nome = trim($body['nome'] ?? '');
    if ($nome === '') json_error('Nome da unidade é obrigatório.', 400);

    $endereco = $body['endereco'] ?? [];
    $codigo = gerar_codigo($pdo, 'unidades', 'UNI', 2);

    $pdo->prepare(
        'INSERT INTO unidades (codigo, nome, tipo, cnpj, responsavel, telefone, email,
            logradouro, numero, bairro, cidade, uf, cep, horario, alvara, salas_velorio, capela, foto, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $codigo, $nome, $body['tipo'] ?? 'Filial', only_digits($body['cnpj'] ?? '') ?: null,
        $body['responsavel'] ?? null, only_digits($body['telefone'] ?? '') ?: null, $body['email'] ?? null,
        $endereco['logradouro'] ?? null, $endereco['numero'] ?? null, $endereco['bairro'] ?? null,
        $endereco['cidade'] ?? null, $endereco['uf'] ?? null, $endereco['cep'] ?? null,
        $body['horario'] ?? null, $body['alvara'] ?? null,
        (int) ($body['salasVelorio'] ?? 0), !empty($body['capela']) ? 1 : 0,
        $body['foto'] ?? null, $body['status'] ?? 'Ativa',
    ]);

    json_response(['id' => $codigo], 201);
}

json_error('Método não permitido.', 405);
