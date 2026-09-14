<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$usuario = require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

function formatar_parceiro(array $p): array {
    return [
        'id' => $p['codigo'],
        'razaoSocial' => $p['razao_social'],
        'nomeFantasia' => $p['nome_fantasia'],
        'cnpj' => $p['cnpj'],
        'tipoParceria' => $p['tipo_parceria'],
        'responsavel' => $p['responsavel'],
        'cidade' => $p['cidade'],
        'uf' => $p['uf'],
        'status' => $p['status'],
        'dadosBancarios' => $p['dados_bancarios'],
        'acordo' => [
            'tipo' => $p['acordo_tipo'],
            'valor' => $p['acordo_valor'] !== null ? (float) $p['acordo_valor'] : 0,
            'vigencia' => $p['acordo_vigencia'],
            'servicosCobertos' => $p['acordo_servicos'] ? json_decode($p['acordo_servicos']) : [],
        ],
        'usuarioPortal' => [
            'login' => $p['portal_login'],
            'ativo' => (bool) $p['portal_ativo'],
            'ultimoAcesso' => $p['portal_ultimo_acesso'],
        ],
    ];
}

if ($method === 'GET') {
    $parceiros = $pdo->query('SELECT * FROM parceiros ORDER BY id DESC')->fetchAll();

    $contatos = $pdo->query('SELECT parceiro_id, nome, funcao, telefone, email FROM parceiro_contatos')->fetchAll();
    $contatosPorParceiro = [];
    foreach ($contatos as $c) {
        $contatosPorParceiro[$c['parceiro_id']][] = ['nome' => $c['nome'], 'funcao' => $c['funcao'], 'telefone' => $c['telefone'], 'email' => $c['email']];
    }

    $out = [];
    foreach ($parceiros as $p) {
        $row = formatar_parceiro($p);
        $row['contatos'] = $contatosPorParceiro[$p['id']] ?? [];
        $out[] = $row;
    }
    json_response($out);
}

if ($method === 'POST') {
    $body = read_json_body();
    $razaoSocial = trim($body['razaoSocial'] ?? '');
    $nomeFantasia = trim($body['nomeFantasia'] ?? '');
    $cnpj = only_digits($body['cnpj'] ?? '');
    if ($razaoSocial === '' || $nomeFantasia === '' || strlen($cnpj) !== 14) {
        json_error('Razão social, nome fantasia e CNPJ válidos são obrigatórios.', 400);
    }

    $existe = $pdo->prepare('SELECT id FROM parceiros WHERE cnpj = ?');
    $existe->execute([$cnpj]);
    if ($existe->fetch()) json_error('Já existe um parceiro cadastrado com esse CNPJ.', 409);

    $tipoDesconto = $body['tipoDesconto'] ?? '';
    $acordoTipo = $tipoDesconto === 'Porcentagem (%)' ? 'Percentual' : ($tipoDesconto ? 'Fixo por atendimento' : null);
    $acordoValor = isset($body['valorDesconto']) && $body['valorDesconto'] !== '' ? (float) $body['valorDesconto'] : null;

    $pdo->beginTransaction();
    try {
        $codigo = gerar_codigo($pdo, 'parceiros', 'PAR', 3, 101);
        $pdo->prepare(
            'INSERT INTO parceiros (codigo, razao_social, nome_fantasia, cnpj, tipo_parceria, responsavel,
                cidade, uf, status, acordo_tipo, acordo_valor)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, \'Ativo\', ?, ?)'
        )->execute([
            $codigo, $razaoSocial, $nomeFantasia, $cnpj,
            $body['categoria'] ?? null, $body['responsavel'] ?? null,
            $body['cidade'] ?? null, $body['uf'] ?? null,
            $acordoTipo, $acordoValor,
        ]);
        $parceiroId = (int) $pdo->lastInsertId();

        $contatoNome = trim($body['contatoNome'] ?? '');
        if ($contatoNome !== '') {
            $pdo->prepare('INSERT INTO parceiro_contatos (parceiro_id, nome, funcao, telefone, email) VALUES (?, ?, ?, ?, ?)')
                ->execute([$parceiroId, $contatoNome, 'Contato principal', only_digits($body['contatoTelefone'] ?? '') ?: null, $body['contatoEmail'] ?? null]);
        }

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        json_error('Erro ao criar parceiro.', 500);
    }

    json_response(['id' => $codigo], 201);
}

json_error('Método não permitido.', 405);
