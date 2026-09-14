<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$usuario = require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

function formatar_obito_resumo(array $o, array $depNomes): array {
    return [
        'id' => $o['codigo'],
        'status' => $o['status'],
        'abertoEm' => $o['aberto_em'],
        'responsavel' => $o['responsavel_nome'],
        'falecido' => [
            'nome' => $o['falecido_nome'], 'cpf' => $o['falecido_cpf'],
            'nascimento' => $o['falecido_nascimento'], 'obitoEm' => $o['falecido_obito_em'],
            'localObito' => $o['falecido_local_obito'], 'causaDeclarada' => $o['falecido_causa_declarada'],
            'numeroDO' => $o['falecido_numero_do'], 'cartorio' => $o['falecido_cartorio'],
        ],
        'vinculo' => [
            'tipo' => $o['vinculo_tipo'], 'clienteId' => $o['cliente_codigo'], 'contratoId' => $o['contrato_codigo'],
            'dependenteNome' => $o['dependente_id'] ? ($depNomes[$o['dependente_id']] ?? null) : null,
        ],
        'valorTotal' => (float) $o['valor_total'],
    ];
}

if ($method === 'GET') {
    $rows = $pdo->query(
        'SELECT o.*, u.nome AS responsavel_nome, cl.codigo AS cliente_codigo, ct.codigo AS contrato_codigo
         FROM obitos o
         LEFT JOIN usuarios u ON u.id = o.responsavel_usuario_id
         LEFT JOIN clientes cl ON cl.id = o.cliente_id
         LEFT JOIN contratos ct ON ct.id = o.contrato_id
         ORDER BY o.id DESC'
    )->fetchAll();

    $deps = $pdo->query('SELECT id, nome FROM dependentes')->fetchAll();
    $depNomes = [];
    foreach ($deps as $d) $depNomes[$d['id']] = $d['nome'];

    json_response(array_map(fn($o) => formatar_obito_resumo($o, $depNomes), $rows));
}

if ($method === 'POST') {
    $body = read_json_body();
    $tipoAtendimento = $body['tipoAtendimento'] ?? '';
    $falecido = $body['falecido'] ?? [];
    $falecidoNome = trim($falecido['nome'] ?? '');
    $obitoEm = $body['obitoEm'] ?? '';

    if (!in_array($tipoAtendimento, ['Particular', 'Plano'], true)) json_error('Tipo de atendimento inválido.', 400);
    if ($falecidoNome === '') json_error('Nome do falecido é obrigatório.', 400);
    if ($obitoEm === '') json_error('Data e horário do óbito são obrigatórios.', 400);

    $clienteId = null; $contratoId = null; $dependenteId = null; $vinculoTipo = 'Particular';
    $coberturaPlanoAtivo = null; $coberturaCarencia = null; $coberturaDependente = null; $coberturaAdimplente = null;

    if ($tipoAtendimento === 'Plano') {
        $cliente = $pdo->prepare('SELECT id FROM clientes WHERE codigo = ?');
        $cliente->execute([$body['clienteId'] ?? '']);
        $clienteId = $cliente->fetchColumn();
        if (!$clienteId) json_error('Cliente não encontrado.', 404);

        $contrato = $pdo->prepare('SELECT c.id, c.situacao, c.inicio, p.carencia_dias FROM contratos c JOIN planos_produto p ON p.id = c.plano_id WHERE c.codigo = ? AND c.cliente_id = ?');
        $contrato->execute([$body['contratoId'] ?? '', $clienteId]);
        $contratoRow = $contrato->fetch();
        if (!$contratoRow) json_error('Contrato não encontrado para este cliente.', 404);
        $contratoId = $contratoRow['id'];

        $beneficiarioId = $body['beneficiarioId'] ?? '';
        if ($beneficiarioId !== 'titular' && $beneficiarioId !== '') {
            $dep = $pdo->prepare('SELECT id FROM dependentes WHERE codigo = ? AND cliente_id = ?');
            $dep->execute([$beneficiarioId, $clienteId]);
            $dependenteId = $dep->fetchColumn();
            if (!$dependenteId) json_error('Dependente não encontrado para este cliente.', 404);
            $vinculoTipo = 'Dependente';
        } else {
            $vinculoTipo = 'Titular';
        }

        // Validação de cobertura, calculada a partir de dados reais de contrato/parcelas.
        $coberturaPlanoAtivo = !in_array($contratoRow['situacao'], ['Cancelado', 'Suspenso', 'Encerrado'], true);
        $dias = (strtotime(substr($obitoEm, 0, 10)) - strtotime($contratoRow['inicio'])) / 86400;
        $coberturaCarencia = $dias >= (int) $contratoRow['carencia_dias'];
        $coberturaDependente = true; // só é possível escolher alguém do próprio agregado familiar
        $venc = $pdo->prepare("SELECT COUNT(*) FROM contrato_parcelas WHERE contrato_id = ? AND status = 'Em aberto' AND vencimento < CURDATE()");
        $venc->execute([$contratoId]);
        $coberturaAdimplente = ((int) $venc->fetchColumn()) === 0;
    }

    $servicos = $body['servicos'] ?? [];
    $valorTotal = 0;
    foreach ($servicos as $s) {
        if (empty($s['coberto'])) $valorTotal += (float) ($s['valor'] ?? 0);
    }

    $pdo->beginTransaction();
    try {
        $codigo = gerar_codigo($pdo, 'obitos', 'OB-2026', 4, 1001);
        $pdo->prepare(
            'INSERT INTO obitos (codigo, status, responsavel_usuario_id, falecido_nome, falecido_cpf, falecido_nascimento,
                falecido_obito_em, falecido_local_obito, falecido_causa_declarada, falecido_numero_do, falecido_cartorio,
                vinculo_tipo, cliente_id, contrato_id, dependente_id,
                cobertura_plano_ativo, cobertura_carencia_cumprida, cobertura_dependente_incluido, cobertura_adimplente,
                valor_total)
             VALUES (?, \'Aberto\', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        )->execute([
            $codigo, $usuario['id'], $falecidoNome,
            only_digits($falecido['cpf'] ?? '') ?: null, $falecido['nascimento'] ?: null, $obitoEm,
            $body['localObito'] ?? null, $body['causaDeclarada'] ?? null, $body['numeroDO'] ?? null, $body['cartorio'] ?? null,
            $vinculoTipo, $clienteId, $contratoId, $dependenteId,
            $coberturaPlanoAtivo, $coberturaCarencia, $coberturaDependente, $coberturaAdimplente,
            $valorTotal,
        ]);
        $obitoId = (int) $pdo->lastInsertId();

        $insertServico = $pdo->prepare('INSERT INTO obito_servicos (obito_id, nome, coberto, valor) VALUES (?, ?, ?, ?)');
        foreach ($servicos as $s) {
            $nome = trim($s['nome'] ?? '');
            if ($nome === '') continue;
            $insertServico->execute([$obitoId, $nome, !empty($s['coberto']) ? 1 : 0, (float) ($s['valor'] ?? 0)]);
        }

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        json_error('Erro ao registrar óbito.', 500);
    }

    json_response(['id' => $codigo], 201);
}

json_error('Método não permitido.', 405);
