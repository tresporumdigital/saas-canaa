# PRD — Sistema de Gestão Funerária Canaã

**Versão:** 1.0
**Data:** 27/08/2026
**Status:** Draft para validação
**Responsável pelo produto:** _(a definir)_

---

## 1. Visão geral

O Sistema de Gestão Funerária Canaã é uma plataforma web única para operar todo o negócio da funerária: venda e cobrança recorrente de planos, atendimento de óbitos, rede de parceiros comerciais, locação e venda de equipamentos para convalescentes, faturamento e controle financeiro.

Hoje a operação depende de planilhas, cadernos de controle e comunicação informal com parceiros. Isso gera inadimplência não detectada, perda de equipamentos emprestados, retrabalho no acionamento de parceiros e falta de visibilidade financeira. O sistema substitui esses controles paralelos por um registro único e rastreável.

### 1.1 Objetivos do produto

| # | Objetivo | Métrica de sucesso |
|---|---|---|
| O1 | Reduzir inadimplência de planos | Queda de X% na inadimplência em 6 meses |
| O2 | Eliminar perda de equipamentos emprestados | 100% dos equipamentos com localização conhecida |
| O3 | Reduzir tempo de acionamento de parceiro | Guia emitida em < 2 minutos |
| O4 | Centralizar o financeiro | Fechamento mensal sem planilhas externas |
| O5 | Dar autonomia ao parceiro | 100% das baixas registradas pelo próprio parceiro |

### 1.2 Fora de escopo (v1)

- Comunicação via WhatsApp (notificações, cobranças e envio de carnês por WhatsApp) — **adiado para versão futura**
- App mobile nativo
- Folha de pagamento e RH
- Contabilidade fiscal completa (o sistema emite NF, não substitui o contador)

---

## 2. Personas e perfis de acesso

| Perfil | Quem é | O que faz no sistema |
|---|---|---|
| **Administrador** | Sócio/gestor da funerária | Acesso total, configurações, relatórios financeiros |
| **Atendente** | Equipe de balcão e telefone | Cadastros, vendas, carnês, registro de óbito |
| **Financeiro** | Responsável por cobrança | Conciliação, inadimplência, emissão de NF |
| **Operacional** | Equipe de campo/estoque | Empréstimo, devolução e conferência de equipamentos |
| **Parceiro comercial** | Empresa/pessoa parceira externa | Acesso restrito: consulta de plano, baixa de atendimento, histórico próprio |
| **Cliente (site)** | Público externo | Formulários de contato/lead no site institucional |

---

## 3. Requisitos funcionais

### 3.1 Dashboard

**Descrição:** Visão geral do negócio em tempo real — planos, financeiro, equipamentos e atendimentos em uma única tela.

**Requisitos:**
- RF-01 — Exibir indicadores do mês: planos ativos, novos planos, cancelamentos, receita recebida, receita prevista, inadimplência (valor e %).
- RF-02 — Exibir bloco de equipamentos: total em estoque, emprestados, atrasados na devolução, vendidos no mês.
- RF-03 — Exibir bloco de atendimentos: óbitos registrados no período e atendimentos por parceiro.
- RF-04 — Exibir alertas acionáveis: carnês vencidos, devoluções atrasadas, planos a renovar nos próximos 30 dias, notas fiscais pendentes.
- RF-05 — Permitir filtro por período (hoje, semana, mês, intervalo customizado).
- RF-06 — Cada card deve ser clicável e levar à listagem detalhada correspondente.
- RF-07 — O conteúdo do dashboard respeita o perfil do usuário (parceiro não vê financeiro global).

**Critérios de aceite:** o dashboard carrega em até 3s com dados do dia corrente; os números batem com os relatórios detalhados.

---

### 3.2 Cadastro de Clientes

**Descrição:** Ficha completa com histórico de planos contratados, atendimentos realizados e equipamentos em uso.

**Requisitos:**
- RF-08 — Cadastrar cliente titular com: nome, CPF, RG, data de nascimento, telefone(s), e-mail, endereço completo com CEP.
- RF-09 — Cadastrar dependentes vinculados ao titular (nome, CPF, parentesco, data de nascimento), com regras de carência e limite por tipo de plano.
- RF-10 — Exibir na ficha: planos contratados (ativos e encerrados), situação de pagamento, atendimentos realizados, equipamentos emprestados ou comprados, notas fiscais emitidas.
- RF-11 — Impedir cadastro duplicado por CPF, com alerta e opção de abrir o cadastro existente.
- RF-12 — Registrar histórico de alterações (quem alterou, o quê e quando).
- RF-13 — Busca por nome, CPF, telefone ou número do contrato.
- RF-14 — Anexar documentos digitalizados à ficha (RG, contrato assinado, comprovante de residência).
- RF-15 — Permitir inativação do cadastro sem exclusão física dos dados.

**Critérios de aceite:** ao abrir uma ficha, o operador vê em uma tela a situação financeira e operacional completa do cliente sem precisar navegar para outro módulo.

---

### 3.3 Cadastro de Parceiros

**Descrição:** Gestão de parceiros comerciais com contatos, acordos e histórico completo de atendimentos realizados.

**Requisitos:**
- RF-16 — Cadastrar parceiro com razão social, CNPJ/CPF, tipo de parceria, endereço, contatos e dados bancários.
- RF-17 — Registrar o acordo comercial: tipo de remuneração (fixo por atendimento, percentual, comissão de venda), valores, vigência e serviços cobertos.
- RF-18 — Registrar múltiplos contatos por parceiro com função e telefone.
- RF-19 — Exibir histórico de atendimentos realizados pelo parceiro, com status e valores.
- RF-20 — Criar usuário de acesso do parceiro ao portal restrito, com permissões limitadas.
- RF-21 — Ativar/inativar parceiro sem perder histórico.
- RF-22 — Anexar contrato de parceria digitalizado.

---

### 3.4 Geração de Guia para Parceiros

**Descrição:** Guia de atendimento gerada automaticamente para cada parceiro acionado, com rastreamento de status.

**Requisitos:**
- RF-23 — Gerar guia a partir de um atendimento/óbito, com número sequencial único.
- RF-24 — A guia deve conter: dados do falecido/cliente, plano e cobertura, parceiro acionado, serviço solicitado, valor acordado, data/hora de emissão e responsável pela emissão.
- RF-25 — Controlar o ciclo de status: `Emitida → Enviada → Aceita → Em execução → Concluída → Faturada`, com data/hora e responsável em cada transição.
- RF-26 — Permitir cancelamento de guia com justificativa obrigatória e registro em log.
- RF-27 — Disponibilizar a guia em PDF para impressão e envio por e-mail.
- RF-28 — Exibir a guia no portal do parceiro para aceite e atualização de status.
- RF-29 — Validar automaticamente se o serviço solicitado está coberto pelo plano do cliente e alertar quando não estiver.
- RF-30 — Listar guias por parceiro, período e status, com totalizador de valores a pagar ao parceiro.

**Critérios de aceite:** ao registrar um óbito e selecionar o parceiro, a guia é emitida sem redigitação de dados do cliente.

---

### 3.5 Vendas de Planos com Cobrança Mensal

**Descrição:** Venda, controle e renovação automática de planos com cobrança recorrente e controle de inadimplência.

**Requisitos:**
- RF-31 — Cadastrar produtos de plano: nome, valor mensal, coberturas incluídas, limite de dependentes, carência, regras de reajuste.
- RF-32 — Contratar plano para um cliente, definindo data de início, dia de vencimento, forma de pagamento e vendedor responsável.
- RF-33 — Gerar automaticamente as parcelas mensais recorrentes conforme a vigência.
- RF-34 — Renovar o plano automaticamente ao fim da vigência, com aplicação de reajuste configurável.
- RF-35 — Classificar automaticamente a situação do plano: `Ativo`, `Em atraso`, `Suspenso`, `Cancelado`, com regras de dias de tolerância parametrizáveis.
- RF-36 — Bloquear ou alertar o uso de cobertura quando o plano estiver inadimplente além do prazo configurado.
- RF-37 — Registrar cancelamento com motivo e data efetiva.
- RF-38 — Relatório de inadimplência com aging (1–30, 31–60, 61–90, +90 dias).
- RF-39 — Registrar negociações/acordos de dívida com novo parcelamento.

**Regras de negócio:**
- RN-01 — A carência começa a contar da data de início do plano, não da data de cadastro.
- RN-02 — Plano suspenso por inadimplência é reativado automaticamente ao registrar a quitação.
- RN-03 — O cancelamento não apaga o histórico de atendimentos já realizados.

---

### 3.6 Vendas de Equipamentos para Convalescentes

**Descrição:** Controle de estoque, venda e faturamento de equipamentos de apoio à convalescência.

**Requisitos:**
- RF-40 — Cadastrar produtos com código, descrição, categoria, preço de custo, preço de venda e estoque mínimo.
- RF-41 — Registrar venda com cliente, itens, quantidades, desconto, forma de pagamento e vendedor.
- RF-42 — Baixar o estoque automaticamente na confirmação da venda.
- RF-43 — Alertar quando o estoque atingir o mínimo configurado.
- RF-44 — Permitir venda parcelada, gerando as parcelas no financeiro.
- RF-45 — Registrar devolução/troca com estorno de estoque e financeiro.
- RF-46 — Acionar a emissão de nota fiscal a partir da venda concluída.
- RF-47 — Relatório de vendas por período, produto e vendedor, com margem.

---

### 3.7 Empréstimo de Equipamentos

**Descrição:** Controle completo de saída, devolução e disponibilidade do inventário de equipamentos emprestados.

**Requisitos:**
- RF-48 — Manter inventário unitário com número de patrimônio por equipamento (cada unidade é rastreável individualmente).
- RF-49 — Registrar saída de empréstimo com cliente, equipamento, data de saída, previsão de devolução, responsável pela retirada e estado de conservação na saída.
- RF-50 — Vincular o empréstimo ao plano do cliente quando for benefício de cobertura, ou registrar valor de locação quando não for.
- RF-51 — Registrar devolução com data, estado de conservação e observações; devolver a unidade ao estoque disponível.
- RF-52 — Controlar o status da unidade: `Disponível`, `Emprestado`, `Em manutenção`, `Baixado`.
- RF-53 — Listar empréstimos com devolução atrasada e exibir alerta no dashboard.
- RF-54 — Impedir empréstimo de unidade que não esteja com status `Disponível`.
- RF-55 — Gerar termo de empréstimo/responsabilidade em PDF para assinatura.
- RF-56 — Registrar histórico completo de cada unidade (todos os empréstimos e manutenções).

**Critérios de aceite:** é possível responder, a qualquer momento, "onde está a cadeira de rodas nº 014 e desde quando".

---

### 3.8 Integração com o Site

**Descrição:** Captação de leads e dados do site integrada diretamente ao sistema de cadastro de clientes.

**Requisitos:**
- RF-57 — Receber submissões dos formulários do site institucional (contato, simulação de plano, interesse em equipamento) via API.
- RF-58 — Criar automaticamente um lead no sistema com origem, data/hora, dados informados e página de origem.
- RF-59 — Exibir fila de leads com status: `Novo`, `Em contato`, `Convertido`, `Perdido` (com motivo).
- RF-60 — Converter lead em cliente sem redigitação dos dados.
- RF-61 — Notificar por e-mail a equipe responsável a cada novo lead.
- RF-62 — Proteger o endpoint contra spam (rate limit e validação anti-bot).
- RF-63 — Registrar consentimento LGPD do formulário junto ao lead.
- RF-64 — Relatório de conversão por origem e período.

---

### 3.9 Pagamento Integrado com Banco

**Descrição:** Recebimento de pagamentos online com conciliação automática e atualização em tempo real no sistema.

**Requisitos:**
- RF-65 — Integrar com o banco/PSP para emissão de boletos e cobranças Pix.
- RF-66 — Receber retorno automático de pagamentos (webhook e/ou arquivo de retorno CNAB).
- RF-67 — Conciliar automaticamente o pagamento com a parcela correspondente pelo identificador da cobrança.
- RF-68 — Atualizar a situação do plano/venda imediatamente após a confirmação.
- RF-69 — Registrar pagamentos parciais, juros, multa e desconto conforme regras configuradas.
- RF-70 — Permitir baixa manual com justificativa quando o pagamento vier por fora (dinheiro, transferência direta).
- RF-71 — Exibir fila de exceções de conciliação (pagamentos sem parcela correspondente) para tratamento manual.
- RF-72 — Manter log de todas as chamadas à API bancária para auditoria.

**Regras de negócio:**
- RN-04 — Nenhuma baixa é definitiva sem registro de usuário responsável e data/hora.
- RN-05 — Pagamento identificado em duplicidade gera crédito na conta do cliente, não baixa dupla.

---

### 3.10 Gerador de Carnês

**Descrição:** Carnês de pagamento gerados em segundos, com envio automático para o cliente via e-mail.

**Requisitos:**
- RF-73 — Gerar carnê anual (ou por vigência) com todas as parcelas do plano em PDF.
- RF-74 — Cada parcela deve conter código de barras/linha digitável do boleto ou QR Code Pix válido.
- RF-75 — Aplicar identidade visual da Funerária Canaã ao layout do carnê.
- RF-76 — Gerar carnês em lote para múltiplos clientes.
- RF-77 — Enviar o carnê por e-mail automaticamente ao cliente e registrar o envio.
- RF-78 — Reemitir carnê ou parcela avulsa com nova data de vencimento.
- RF-79 — Registrar no histórico do cliente cada geração e cada envio.

> **Nota:** o envio via WhatsApp está previsto para versão futura e não faz parte do escopo desta entrega.

---

### 3.11 Registro de Óbito

**Descrição:** Registro completo do atendimento funerário vinculado ao cadastro do cliente e ao plano contratado.

**Requisitos:**
- RF-80 — Registrar óbito com dados do falecido, data/hora e local do óbito, causa declarada, número da declaração de óbito e cartório.
- RF-81 — Vincular o falecido a um cliente/dependente cadastrado ou registrar atendimento particular (sem plano).
- RF-82 — Validar automaticamente a cobertura: plano ativo, carência cumprida, dependente incluído, adimplência.
- RF-83 — Registrar os serviços prestados (urna, preparação, translado, velório, sepultamento/cremação, documentação) com o que é coberto e o que é cobrado à parte.
- RF-84 — Registrar dados do solicitante/responsável e do local de velório e sepultamento.
- RF-85 — Acionar parceiros a partir do atendimento, gerando as guias correspondentes.
- RF-86 — Anexar documentos (DO, autorizações, comprovantes).
- RF-87 — Gerar o valor final do atendimento e enviá-lo ao financeiro e à emissão de NF.
- RF-88 — Manter status do atendimento: `Aberto → Em andamento → Concluído`.

**Critérios de aceite:** ao iniciar um registro de óbito de cliente com plano, o sistema informa em tela se há cobertura, carência pendente ou inadimplência antes de prosseguir.

---

### 3.12 Backups Automáticos

**Descrição:** Backup diário automático dos dados com restauração garantida em caso de falha — sem custo adicional (incluso).

**Requisitos:**
- RF-89 — Executar backup completo automático diário do banco de dados e dos arquivos anexados.
- RF-90 — Armazenar os backups em local externo ao servidor de produção, com criptografia.
- RF-91 — Manter política de retenção: 7 diários, 4 semanais, 12 mensais.
- RF-92 — Registrar log de cada execução com status de sucesso ou falha.
- RF-93 — Notificar o administrador por e-mail em caso de falha de backup.
- RF-94 — Permitir restauração completa, testada periodicamente, com RPO ≤ 24h e RTO ≤ 4h.
- RF-95 — Exibir ao administrador a data e o status do último backup.

---

### 3.13 Emissão de Nota Fiscal

**Descrição:** Nota fiscal emitida diretamente do sistema, com os dados da venda já preenchidos automaticamente.

**Requisitos:**
- RF-96 — Emitir NFS-e (serviços funerários, planos) e NF-e (venda de equipamentos) conforme o tipo de operação.
- RF-97 — Pré-preencher a nota com os dados do cliente, itens, valores e impostos a partir da venda ou atendimento.
- RF-98 — Integrar com a prefeitura/SEFAZ ou provedor de emissão, com tratamento de erros de validação.
- RF-99 — Armazenar XML e DANFE/PDF vinculados ao registro de origem e à ficha do cliente.
- RF-100 — Permitir cancelamento e carta de correção dentro dos prazos legais, com justificativa.
- RF-101 — Exibir fila de notas pendentes de emissão e de notas rejeitadas.
- RF-102 — Enviar a nota ao cliente por e-mail.
- RF-103 — Relatório de notas emitidas por período para o contador (exportação em XML/CSV).

---

### 3.14 Baixa de Planos por Parceiros Comerciais

**Descrição:** Parceiros registram o uso de planos diretamente no sistema — rastreamento completo e sem retrabalho.

**Requisitos:**
- RF-104 — Disponibilizar portal restrito para o parceiro, com login próprio.
- RF-105 — Permitir ao parceiro consultar a situação de um plano por CPF/número de contrato, vendo apenas o necessário para o atendimento (cobertura e situação, sem dados financeiros internos).
- RF-106 — Permitir ao parceiro registrar a baixa do uso do plano, informando serviço prestado, data/hora, valor e observações.
- RF-107 — Anexar comprovantes na baixa.
- RF-108 — Refletir a baixa imediatamente no histórico do cliente e no fechamento do parceiro.
- RF-109 — Exigir aprovação interna para baixas acima de valor configurável ou fora da cobertura.
- RF-110 — Registrar log de auditoria com IP, usuário e data/hora de cada baixa.
- RF-111 — Exibir ao parceiro seu extrato de atendimentos e valores a receber no período.

**Regras de negócio:**
- RN-06 — O parceiro nunca vê dados de outros parceiros nem o financeiro global da funerária.
- RN-07 — Baixa registrada por parceiro não pode ser excluída, apenas estornada com justificativa por usuário interno.

---

### 3.15 Controle Financeiro

**Descrição:** Visão completa de entradas, saídas, inadimplência e projeções — financeiro sempre em dia e rastreado.

**Requisitos:**
- RF-112 — Registrar contas a receber automaticamente a partir de planos, vendas e atendimentos.
- RF-113 — Registrar contas a pagar, incluindo repasses a parceiros, fornecedores e despesas fixas.
- RF-114 — Classificar lançamentos por categoria e centro de custo configuráveis.
- RF-115 — Gerar fluxo de caixa realizado e projetado por período.
- RF-116 — Consolidar inadimplência com aging e valor recuperável.
- RF-117 — Fechar caixa diário com conferência de entradas por forma de pagamento.
- RF-118 — Gerar DRE gerencial simplificado por mês.
- RF-119 — Exportar relatórios em PDF e CSV/Excel.
- RF-120 — Manter trilha de auditoria imutável de todo lançamento (criação, alteração, estorno).

---

## 4. Requisitos não funcionais

| ID | Categoria | Requisito |
|---|---|---|
| RNF-01 | Desempenho | Telas de listagem carregam em ≤ 3s com até 50 mil registros |
| RNF-02 | Disponibilidade | 99,5% mensal; sistema crítico 24/7 (óbitos ocorrem fora do horário comercial) |
| RNF-03 | Segurança | Autenticação com senha forte, sessão expirável, 2FA para perfis Administrador e Financeiro |
| RNF-04 | Segurança | Dados sensíveis criptografados em repouso e tráfego sempre em HTTPS |
| RNF-05 | LGPD | Base legal registrada por finalidade; controle de consentimento; rotina de anonimização/exclusão sob solicitação |
| RNF-06 | Auditoria | Log imutável de acessos e de operações críticas (financeiro, baixas, cancelamentos) |
| RNF-07 | Usabilidade | Operação principal (registro de óbito, emissão de guia) executável por atendente em até 5 minutos, com treinamento de 1 hora |
| RNF-08 | Responsividade | Interface utilizável em desktop e tablet; portal do parceiro utilizável em celular |
| RNF-09 | Acessibilidade | Contraste e navegação por teclado conforme WCAG 2.1 nível AA nas telas principais |
| RNF-10 | Manutenibilidade | Ambientes separados de homologação e produção; deploy versionado |
| RNF-11 | Integrações | Falha de serviço externo (banco, NF) não pode bloquear o cadastro do atendimento — enfileirar e reprocessar |

---

## 5. Integrações externas

| Integração | Finalidade | Criticidade |
|---|---|---|
| Banco / PSP | Boleto, Pix, retorno de pagamento e conciliação | Alta |
| Prefeitura / SEFAZ ou provedor de NF | Emissão de NFS-e e NF-e | Alta |
| Site institucional | Captação de leads via API | Média |
| Serviço de e-mail transacional | Envio de carnês, notas e notificações | Média |
| Serviço de armazenamento externo | Backups criptografados | Alta |

---

## 6. Modelo de dados (entidades principais)

- **Cliente** (titular) → **Dependente**
- **Plano** (produto) → **Contrato de Plano** → **Parcela**
- **Parceiro** → **Acordo Comercial** → **Guia de Atendimento** → **Baixa de Plano**
- **Equipamento** → **Unidade de Equipamento** → **Empréstimo** / **Venda**
- **Atendimento de Óbito** → **Serviço Prestado** → **Guia** / **Nota Fiscal**
- **Lançamento Financeiro** (a receber / a pagar) → **Pagamento** → **Conciliação**
- **Lead** → conversão em **Cliente**
- **Usuário** → **Perfil** → **Permissão**
- **Log de Auditoria** (transversal)

---

## 7. Fluxos críticos

### 7.1 Venda de plano até primeira cobrança
Cadastro do cliente → escolha do plano → definição de vencimento e forma de pagamento → geração das parcelas → geração do carnê → envio por e-mail → recebimento e conciliação automática.

### 7.2 Atendimento de óbito com parceiro
Registro do óbito → validação de cobertura (plano ativo, carência, adimplência) → seleção dos serviços → acionamento do parceiro → emissão da guia → execução e atualização de status pelo parceiro → baixa registrada → apuração de valores → emissão da nota fiscal → lançamento financeiro.

### 7.3 Empréstimo e devolução de equipamento
Consulta de disponibilidade → registro da saída com patrimônio e previsão de devolução → geração do termo → alerta automático em caso de atraso → registro da devolução e do estado de conservação → unidade retorna a `Disponível`.

### 7.4 Lead do site até cliente
Formulário no site → criação do lead → notificação da equipe → contato e atualização de status → conversão em cliente com aproveitamento dos dados.

---

## 8. Roadmap de entrega

| Fase | Escopo | Justificativa |
|---|---|---|
| **Fase 1 — Núcleo** | Cadastro de Clientes, Cadastro de Parceiros, Registro de Óbito, Geração de Guia, Backups Automáticos, controle de acesso | Base sobre a qual tudo depende; resolve o retrabalho mais crítico |
| **Fase 2 — Receita** | Vendas de Planos com cobrança mensal, Gerador de Carnês, Pagamento Integrado com Banco, Controle Financeiro | Ataca diretamente a inadimplência |
| **Fase 3 — Operação** | Empréstimo de Equipamentos, Vendas de Equipamentos, Emissão de Nota Fiscal | Fecha o controle patrimonial e fiscal |
| **Fase 4 — Expansão** | Baixa de Planos por Parceiros (portal), Integração com o Site, Dashboard consolidado | Depende dos dados gerados pelas fases anteriores |
| **Futuro** | Comunicação via WhatsApp (módulo adicional) | Fora do escopo desta versão |

---

## 9. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Homologação lenta da NF junto à prefeitura | Atraso na Fase 3 | Iniciar homologação já na Fase 1 |
| Parceiros resistirem ao portal | Baixa adoção do módulo de baixas | Treinamento presencial + manter alternativa de baixa interna |
| Migração de dados de planilhas com inconsistência | Base inicial suja | Etapa dedicada de higienização com validação do cliente antes do go-live |
| Indisponibilidade fora do horário comercial | Atendimento de óbito bloqueado | Modo de contingência: registro offline/simplificado com sincronização posterior |
| Vazamento de dados sensíveis | Sanção LGPD e dano reputacional | Criptografia, controle de perfis, logs de acesso e revisão periódica de permissões |

---

## 10. Perguntas em aberto

1. Qual banco/PSP será utilizado para boleto e Pix?
2. A emissão de NF será direta com a prefeitura ou via provedor terceirizado?
3. Quais são exatamente os tipos de plano vendidos hoje, com valores, coberturas e carências?
4. Qual o modelo de remuneração dos parceiros (fixo, percentual ou misto)?
5. Existe base histórica a migrar? Em qual formato e qual volume?
6. Quantos usuários simultâneos são esperados por perfil?
7. Há exigência de contingência offline para atendimentos noturnos?
