<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$usuario = require_auth($pdo);
$codigo = $_GET['id'] ?? '';
if ($codigo === '') json_error('ID inválido.', 400);

$stmt = $pdo->prepare('SELECT * FROM parceiros WHERE codigo = ?');
$stmt->execute([$codigo]);
$parceiro = $stmt->fetch();
if (!$parceiro) json_error('Parceiro não encontrado.', 404);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $contatos = $pdo->prepare('SELECT nome, funcao, telefone, email FROM parceiro_contatos WHERE parceiro_id = ?');
    $contatos->execute([$parceiro['id']]);

    json_response([
        'id' => $parceiro['codigo'],
        'razaoSocial' => $parceiro['razao_social'],
        'nomeFantasia' => $parceiro['nome_fantasia'],
        'cnpj' => $parceiro['cnpj'],
        'tipoParceria' => $parceiro['tipo_parceria'],
        'responsavel' => $parceiro['responsavel'],
        'cidade' => $parceiro['cidade'],
        'uf' => $parceiro['uf'],
        'status' => $parceiro['status'],
        'dadosBancarios' => $parceiro['dados_bancarios'],
        'acordo' => [
            'tipo' => $parceiro['acordo_tipo'],
            'valor' => $parceiro['acordo_valor'] !== null ? (float) $parceiro['acordo_valor'] : 0,
            'vigencia' => $parceiro['acordo_vigencia'],
            'servicosCobertos' => $parceiro['acordo_servicos'] ? json_decode($parceiro['acordo_servicos']) : [],
        ],
        'usuarioPortal' => [
            'login' => $parceiro['portal_login'],
            'ativo' => (bool) $parceiro['portal_ativo'],
            'ultimoAcesso' => $parceiro['portal_ultimo_acesso'],
        ],
        'contatos' => $contatos->fetchAll(),
    ]);
}

if ($method === 'PUT') {
    $body = read_json_body();
    $tipoDesconto = $body['tipoDesconto'] ?? null;
    $acordoTipo = $parceiro['acordo_tipo'];
    $acordoValor = $parceiro['acordo_valor'];
    if ($tipoDesconto) {
        $acordoTipo = $tipoDesconto === 'Porcentagem (%)' ? 'Percentual' : 'Fixo por atendimento';
        $acordoValor = isset($body['valorDesconto']) && $body['valorDesconto'] !== '' ? (float) $body['valorDesconto'] : $acordoValor;
    }

    $dadosBancarios = array_key_exists('dadosBancarios', $body) ? (trim($body['dadosBancarios']) ?: null) : $parceiro['dados_bancarios'];
    $acordoVigencia = array_key_exists('vigencia', $body) ? (trim($body['vigencia']) ?: null) : $parceiro['acordo_vigencia'];
    $acordoServicos = is_array($body['servicosCobertos'] ?? null)
        ? json_encode(array_values($body['servicosCobertos']), JSON_UNESCAPED_UNICODE)
        : $parceiro['acordo_servicos'];

    $pdo->prepare(
        'UPDATE parceiros SET razao_social=?, nome_fantasia=?, cnpj=?, tipo_parceria=?, responsavel=?,
            cidade=?, uf=?, acordo_tipo=?, acordo_valor=?, dados_bancarios=?, acordo_vigencia=?, acordo_servicos=? WHERE id=?'
    )->execute([
        trim($body['razaoSocial'] ?? $parceiro['razao_social']),
        trim($body['nomeFantasia'] ?? $parceiro['nome_fantasia']),
        $body['cnpj'] ? only_digits($body['cnpj']) : $parceiro['cnpj'],
        $body['categoria'] ?? $parceiro['tipo_parceria'],
        $body['responsavel'] ?? $parceiro['responsavel'],
        $body['cidade'] ?? $parceiro['cidade'],
        $body['uf'] ?? $parceiro['uf'],
        $acordoTipo, $acordoValor, $dadosBancarios, $acordoVigencia, $acordoServicos,
        $parceiro['id'],
    ]);

    $contatoNome = trim($body['contatoNome'] ?? '');
    if ($contatoNome !== '') {
        $primeiro = $pdo->prepare('SELECT id FROM parceiro_contatos WHERE parceiro_id = ? ORDER BY id ASC LIMIT 1');
        $primeiro->execute([$parceiro['id']]);
        $contatoId = $primeiro->fetchColumn();
        if ($contatoId) {
            $pdo->prepare('UPDATE parceiro_contatos SET nome=?, telefone=?, email=? WHERE id=?')
                ->execute([$contatoNome, only_digits($body['contatoTelefone'] ?? '') ?: null, $body['contatoEmail'] ?? null, $contatoId]);
        } else {
            $pdo->prepare('INSERT INTO parceiro_contatos (parceiro_id, nome, funcao, telefone, email) VALUES (?, ?, ?, ?, ?)')
                ->execute([$parceiro['id'], $contatoNome, 'Contato principal', only_digits($body['contatoTelefone'] ?? '') ?: null, $body['contatoEmail'] ?? null]);
        }
    }

    json_response(['ok' => true]);
}

json_error('Método não permitido.', 405);
