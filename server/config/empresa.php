<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

function formatar_empresa(array $e): array {
    return [
        'razaoSocial' => $e['razao_social'],
        'nomeFantasia' => $e['nome_fantasia'],
        'cnpj' => $e['cnpj'],
        'inscricaoEstadual' => $e['inscricao_estadual'],
        'inscricaoMunicipal' => $e['inscricao_municipal'],
        'regimeTributario' => $e['regime_tributario'],
        'cnae' => $e['cnae'],
        'endereco' => [
            'logradouro' => $e['logradouro'], 'numero' => $e['numero'], 'complemento' => $e['complemento'],
            'bairro' => $e['bairro'], 'cidade' => $e['cidade'], 'uf' => $e['uf'], 'cep' => $e['cep'],
        ],
        'telefone' => $e['telefone'],
        'email' => $e['email'],
        'site' => $e['site'],
        'responsavelLegal' => $e['responsavel_legal'],
        'contador' => $e['contador'],
    ];
}

if ($method === 'GET') {
    $row = $pdo->query('SELECT * FROM empresa WHERE id = 1')->fetch();
    json_response($row ? formatar_empresa($row) : null);
}

if ($method === 'PUT') {
    $body = read_json_body();
    $razaoSocial = trim($body['razaoSocial'] ?? '');
    $nomeFantasia = trim($body['nomeFantasia'] ?? '');
    $cnpj = only_digits($body['cnpj'] ?? '');
    if ($razaoSocial === '' || $nomeFantasia === '' || strlen($cnpj) !== 14) {
        json_error('Razão social, nome fantasia e CNPJ válidos são obrigatórios.', 400);
    }

    $endereco = $body['endereco'] ?? [];

    $pdo->prepare(
        'INSERT INTO empresa (id, razao_social, nome_fantasia, cnpj, inscricao_estadual, inscricao_municipal,
            regime_tributario, cnae, logradouro, numero, complemento, bairro, cidade, uf, cep,
            telefone, email, site, responsavel_legal, contador)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            razao_social = VALUES(razao_social), nome_fantasia = VALUES(nome_fantasia), cnpj = VALUES(cnpj),
            inscricao_estadual = VALUES(inscricao_estadual), inscricao_municipal = VALUES(inscricao_municipal),
            regime_tributario = VALUES(regime_tributario), cnae = VALUES(cnae),
            logradouro = VALUES(logradouro), numero = VALUES(numero), complemento = VALUES(complemento),
            bairro = VALUES(bairro), cidade = VALUES(cidade), uf = VALUES(uf), cep = VALUES(cep),
            telefone = VALUES(telefone), email = VALUES(email), site = VALUES(site),
            responsavel_legal = VALUES(responsavel_legal), contador = VALUES(contador)'
    )->execute([
        $razaoSocial, $nomeFantasia, $cnpj,
        $body['inscricaoEstadual'] ?? null, $body['inscricaoMunicipal'] ?? null,
        $body['regimeTributario'] ?? null, $body['cnae'] ?? null,
        $endereco['logradouro'] ?? null, $endereco['numero'] ?? null, $endereco['complemento'] ?? null,
        $endereco['bairro'] ?? null, $endereco['cidade'] ?? null, $endereco['uf'] ?? null, $endereco['cep'] ?? null,
        only_digits($body['telefone'] ?? '') ?: null, $body['email'] ?? null, $body['site'] ?? null,
        $body['responsavelLegal'] ?? null, $body['contador'] ?? null,
    ]);

    json_response(['ok' => true]);
}

json_error('Método não permitido.', 405);
