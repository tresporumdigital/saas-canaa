<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$usuario = require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $rows = $pdo->query(
        'SELECT p.*, pc.numero AS parcela_numero, c.codigo AS contrato_codigo, u.nome AS usuario_nome
         FROM pagamentos p
         LEFT JOIN contrato_parcelas pc ON pc.id = p.parcela_id
         LEFT JOIN contratos c ON c.id = pc.contrato_id
         LEFT JOIN usuarios u ON u.id = p.usuario_id
         ORDER BY p.id DESC'
    )->fetchAll();

    $out = array_map(function ($p) {
        $parcelaRef = $p['contrato_codigo']
            ? $p['contrato_codigo'] . '-P' . str_pad((string) $p['parcela_numero'], 2, '0', STR_PAD_LEFT)
            : null;
        return [
            'id' => $p['codigo'],
            'parcelaRef' => $parcelaRef,
            'contratoRef' => $p['contrato_codigo'],
            'clienteNome' => $p['cliente_nome'],
            'valor' => (float) $p['valor'],
            'meio' => $p['meio'],
            'recebidoEm' => $p['recebido_em'],
            'status' => $p['status'],
            'registradoPor' => $p['usuario_nome'],
            'observacao' => $p['observacao'],
        ];
    }, $rows);

    json_response($out);
}

if ($method === 'POST') {
    $body = read_json_body();
    $parcelaId = $body['parcelaId'] ?? '';
    $valor = isset($body['valor']) ? (float) $body['valor'] : 0;
    $meio = $body['meio'] ?? '';
    $data = $body['data'] ?? '';
    $justificativa = trim($body['justificativa'] ?? '');

    if (!preg_match('/^(.+)-P(\d+)$/', $parcelaId, $m)) {
        json_error('Parcela inválida.', 400);
    }
    [, $contratoCodigo, $numero] = $m;

    if ($valor <= 0 || $data === '' || strlen($justificativa) < 10) {
        json_error('Valor, data e justificativa (mín. 10 caracteres) são obrigatórios.', 400);
    }
    if (!in_array($meio, ['Boleto', 'Pix', 'Dinheiro', 'Transferência', 'Cartão recorrente'], true)) {
        json_error('Forma de pagamento inválida.', 400);
    }

    $contrato = $pdo->prepare('SELECT id, cliente_id FROM contratos WHERE codigo = ?');
    $contrato->execute([$contratoCodigo]);
    $contratoRow = $contrato->fetch();
    if (!$contratoRow) json_error('Contrato não encontrado.', 404);

    $parcela = $pdo->prepare('SELECT id, status FROM contrato_parcelas WHERE contrato_id = ? AND numero = ?');
    $parcela->execute([$contratoRow['id'], (int) $numero]);
    $parcelaRow = $parcela->fetch();
    if (!$parcelaRow) json_error('Parcela não encontrada.', 404);
    if ($parcelaRow['status'] === 'Pago') json_error('Esta parcela já está paga.', 409);

    $cliente = $pdo->prepare('SELECT nome FROM clientes WHERE id = ?');
    $cliente->execute([$contratoRow['cliente_id']]);
    $clienteNome = $cliente->fetchColumn() ?: null;

    $pdo->beginTransaction();
    try {
        $pdo->prepare('UPDATE contrato_parcelas SET status = \'Pago\', pago_em = NOW(), forma = ? WHERE id = ?')
            ->execute([$meio, $parcelaRow['id']]);

        $codigo = gerar_codigo($pdo, 'pagamentos', 'PG-2026', 4, 3000);
        $pdo->prepare(
            'INSERT INTO pagamentos (codigo, parcela_id, cliente_nome, valor, meio, recebido_em, status, observacao, usuario_id)
             VALUES (?, ?, ?, ?, ?, ?, \'Baixa manual\', ?, ?)'
        )->execute([$codigo, $parcelaRow['id'], $clienteNome, $valor, $meio, $data, $justificativa, $usuario['id']]);

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        json_error('Erro ao registrar a baixa.', 500);
    }

    json_response(['id' => $codigo], 201);
}

json_error('Método não permitido.', 405);
