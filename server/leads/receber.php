<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

// Endpoint público (RF-57 do PRD) — recebe submissões do site institucional. Sem
// autenticação de propósito: quem preenche o formulário no site não tem conta no sistema.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Método não permitido.', 405);

$ORIGENS = ['Formulário de contato', 'Simulação de plano', 'Interesse em equipamento'];

$body = read_json_body();
$nome = trim($body['nome'] ?? '');
$telefone = only_digits($body['telefone'] ?? '');
$email = trim($body['email'] ?? '');
$origem = $body['origem'] ?? '';
$paginaOrigem = trim($body['paginaOrigem'] ?? '') ?: null;
$mensagem = trim($body['mensagem'] ?? '') ?: null;
$consentimentoLGPD = !empty($body['consentimentoLGPD']);

if ($nome === '' || strlen($telefone) < 10 || !in_array($origem, $ORIGENS, true)) {
    json_error('Dados do formulário incompletos.', 400);
}

$ip = $_SERVER['REMOTE_ADDR'] ?? null;

// Limite de taxa simples contra spam/bot: no máximo 5 leads por IP por hora, sem tabela nova.
if ($ip) {
    $stmt = $pdo->prepare(
        "SELECT COUNT(*) FROM leads WHERE ip = ? AND recebido_em > (NOW() - INTERVAL 1 HOUR)"
    );
    $stmt->execute([$ip]);
    if ((int) $stmt->fetchColumn() >= 5) {
        json_error('Muitas submissões recentes. Tente novamente mais tarde.', 429);
    }
}

$codigo = gerar_codigo($pdo, 'leads', 'LEAD', 4, 1001);
$pdo->prepare(
    'INSERT INTO leads (codigo, nome, telefone, email, origem, pagina_origem, mensagem, consentimento_lgpd, ip)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
)->execute([$codigo, $nome, $telefone, $email ?: null, $origem, $paginaOrigem, $mensagem, $consentimentoLGPD ? 1 : 0, $ip]);

json_response(['id' => $codigo], 201);
