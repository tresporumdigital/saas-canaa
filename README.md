# Sistema de Gestão Funerária Canaã — Frontend + Backend

Frontend navegável do ERP descrito em [`PRD.md`](./PRD.md). Com as Fases 1-10 do backend, os
módulos **Clientes, Parceiros, Unidades, Usuários** (+ login), **Planos (catálogo), Contratos,
Parcelas**, a **baixa manual de Pagamentos**, **Registro de Óbito + Guias de Atendimento**,
**Equipamentos (catálogo, inventário, Empréstimo e Venda)**, **Notas Fiscais**, **Portal do
Parceiro + Carnês**, **Controle Financeiro (Contas a Pagar/Receber, Fluxo de Caixa,
Inadimplência, Fechamento de Caixa, DRE gerencial)**, **Perfis/Permissões e Backup (registro/
configuração)** e **Leads do Site** são reais, com API própria em PHP/PDO (`server/`, publicada
em `/api/`) e banco MySQL/MariaDB na Hostinger — sem dado de exemplo pré-carregado, é um banco de
produção mesmo. Os demais módulos (Conciliação bancária automática, Parâmetros, Auditoria) ainda
são **mockados** em `src/mock/` (referências cruzadas consistentes entre si) até serem migrados
em fases seguintes.

**Online:** https://backoffice.funerariacanaa.com/

## Acesso (login real)

O sistema abre na **tela de login** (`#/login`). Sem sessão, qualquer rota interna
redireciona para lá.

- **Entrar** com e-mail e senha reais — autenticados contra a tabela `usuarios` no banco
  (`server/auth/login.php`, senha com hash bcrypt). Contas são criadas por um administrador em
  Configurações → Usuários (ou pelo seeder `server/scripts/create_admin.php` para o primeiro
  acesso).
- **Sem cadastro e sem login social** nesta tela.
- A sessão usa um token Bearer (`localStorage.canaa.token`) validado a cada carregamento via
  `/api/auth/me.php`; "Sair" (menu do usuário e drawer mobile) revoga o token no servidor.

## Backend (`server/`)

- PHP 7.4 + PDO/MySQL, um arquivo por endpoint (sem framework/roteador — ver
  `server/_bootstrap.php` para conexão, CORS e helpers de auth/JSON).
  `server/schema.sql` tem o DDL de todas as tabelas (idempotente — `CREATE TABLE IF NOT EXISTS`).
- Credenciais do banco ficam em `server/_config.php`, criado só no servidor (nunca commitado —
  copie `server/_config.example.php`).
- `src/lib/api.js` concentra o cliente HTTP do frontend (`apiFetch`) e os hooks/caches
  reativos (`useClientesCache`, `useParceirosCache`, `usePlanosCache`, `useContratosCache` etc.)
  usados tanto pelas páginas "donas" desses módulos quanto por telas ainda mockadas que só
  precisam ler cliente/parceiro/plano/contrato por id.
- Contratos geram 12 parcelas reais na criação (não são mais calculadas na hora como no mock);
  o status "Vencido" é calculado na leitura a partir do vencimento, não gravado no banco.
- Baixa manual (`server/pagamentos/index.php`) marca a parcela como `Pago` e grava um registro
  de pagamento real, numa transação; uma parcela já paga não pode receber baixa de novo (erro
  409). A aba Conciliação de Pagamentos mistura essas baixas reais com a lista mockada de
  pagamentos "batidos automaticamente com o banco" — só a baixa manual é uma ação real do
  usuário, a conciliação bancária automática continua sendo uma simulação (não há gateway de
  pagamento configurado).
- Códigos gerados (`CLI-`, `PAR-`, `CTR-2026-`, `DEP-`, `OB-2026-`, `GA-2026-`, `EQP-`,
  `EMP-2026-`, `VEQ-2026-`, `NF-2026-`, `BX-2026-`, `CAR-2026-`, `AR-2026-`, `AP-2026-`...) para
  entidades cujo id ainda é referenciado por módulos mockados começam num número alto (ex.:
  contratos reais começam em `CTR-2026-1001`, óbitos em `OB-2026-1001`, guias em
  `GA-2026-01000`, empréstimos em `EMP-2026-1001`, notas fiscais em `NF-2026-1001`, baixas de
  parceiro em `BX-2026-1001`, carnês em `CAR-2026-1001`, contas a receber/pagar em
  `AR-2026-1001`/`AP-2026-1001`) para nunca colidir com os ids fictícios usados nos mocks ainda
  não migrados. O catálogo de equipamentos usa um prefixo novo (`EQP-`) em vez de tentar
  reproduzir a sigla do mock (`EQ-CDR`, `EQ-CMH`...), mais simples e sem risco de colisão.
- Controle Financeiro (`server/financeiro/`) tem duas naturezas: Contas a Pagar/Receber são
  tabelas reais (CRUD completo, com lançamento recorrente para contas a pagar); Fluxo de Caixa,
  Inadimplência (aging) e Fechamento de Caixa são **relatórios calculados no servidor** a partir
  de `pagamentos`/`contas_pagar`/`contas_receber` reais — sem tabela própria, sem inventar dado
  (o campo "recuperável" do aging e a linha "Projetado" do fluxo de caixa somem por não terem
  lastro real). "Vencido" nunca é gravado — é calculado na leitura com `status_parcela_exibido()`
  (mesma função usada em parcelas de contrato desde a Fase 2), mas continua clicável no
  `StatusMenu` para poder virar "Pago"/"Negociado" de verdade. DRE gerencial fica de fora desta
  fase — depende de despesas fixas por categoria sem dado real maduro ainda (entrou na Fase 10,
  ver abaixo).
- Portal do Parceiro (`server/portal/`) e Carnês (`server/carnes/`) são reais desde a Fase 7. O
  Portal continua sem login próprio de parceiro (RF-104 fica como débito técnico documentado,
  igual à Conciliação bancária) — a "sessão de parceiro" é só o seletor de perfil de sempre
  mostrando o primeiro parceiro cadastrado. Uma baixa acima de R$1.500 nasce como "Aguardando
  aprovação" (regra já anunciada na tela antes desta fase, agora aplicada de verdade); aprovar/
  estornar é uma ação do usuário interno, escondida quando o perfil ativo é "Parceiro comercial".
  `ip` e `usuarioPortal` de cada baixa são dados reais (IP da requisição, nome do usuário interno
  autenticado — sem login de parceiro, não há como capturar o usuário do portal de verdade).
  Carnê individual e em lote gravam de verdade e decrementam nada (não afeta parcelas reais); o
  envio por e-mail continua sem efeito real (`enviadoEm` sempre nulo), mesmo raciocínio do envio
  de Nota Fiscal.
- Óbito calcula a "cobertura" (plano ativo, carência cumprida, beneficiário incluído,
  adimplência) no servidor, a partir dos dados reais de contrato/parcelas no momento do
  registro (`server/obitos/index.php`) — não é mais um cálculo simulado no frontend.
- Nota fiscal (`server/notas-fiscais/`) é emitida a partir de três fluxos: manualmente (tela
  Notas Fiscais → "Gerar nota fiscal"), a partir de uma Venda de Equipamento ("Emitir NF-e" no
  passo 3 ou no drawer da venda — grava `vendas_equipamento.nota_fiscal_id`) ou a partir do
  passo 4 de Registrar Óbito. "Emitir agora"/"Corrigir e reenviar" grava `emitida_em` de verdade,
  mas não inventa um `numero` fiscal real (não há integração com SEFAZ/prefeitura) — "Carta de
  correção", download de XML/DANFE e envio por e-mail continuam toast, mesmo raciocínio da
  Conciliação bancária ficar sempre simulada.
- Perfis/Permissões e Backup (`server/config/`) são reais desde a Fase 9. A matriz de
  Perfis/Permissões passa a ser lida do banco e ganha edição real por módulo (antes era só
  leitura). A tabela `perfis_permissoes` e a config
  de Backup (`backup_config`) nasceram com um seed idempotente (`INSERT IGNORE`) reproduzindo os
  mesmos valores que já estavam fixos no mock — é configuração estrutural do sistema, não dado
  de exemplo de negócio. O histórico de execuções (`backup_execucoes`) é uma tabela real, mas
  começa vazia; "Executar agora" e "Solicitar restauração" continuam só um `toast()` — nenhuma
  automação real de backup/restauração do banco de produção foi implementada, mesmo raciocínio
  da Conciliação bancária ficar sempre simulada.
- A Fase 9 chegou a criar uma tabela/aba "Empresa" (cadastro único da matriz), mas foi removida
  logo em seguida a pedido: a empresa só tem **Unidades** (filiais), sem um "perfil" próprio
  separado — `EmpresaConfig.jsx` (apesar do nome) já cobre isso desde a Fase 1. A guia sumiu de
  Configurações → Usuários e a tabela `empresa` foi apagada do banco de produção.
- Leads do Site (`server/leads/`) são reais desde a Fase 10. `POST /api/leads/receber.php` é o
  único endpoint **público** (sem `Authorization`) de todo o backend — implementa o RF-57 do PRD
  para o site institucional enviar leads via API; como esse site ainda não existe/integra com
  nada, a fila nasce e permanece vazia até uma integração real passar a alimentá-la, mesmo assim
  o endpoint já está pronto e com um limite de taxa simples por IP (5 por hora) contra spam.
  Trocar o status de um lead (`Novo`/`Em contato`/`Perdido`) é uma chamada real; "Convertido" só
  acontece pelo botão "Converter em cliente", que abre o mesmo assistente de cadastro de cliente
  já pré-preenchido com nome/telefone/e-mail do lead e, ao concluir, vincula o `cliente_id` real
  ao lead — sem redigitação dos dados (RF-60). Envio de e-mail a cada novo lead (RF-61) e
  proteção anti-bot mais sofisticada que o limite de taxa (RF-62) continuam fora, mesmo raciocínio
  de toda integração externa que este projeto não fabrica.
- DRE gerencial (`server/financeiro/dre.php`) é real desde a Fase 10 — também um relatório
  calculado no servidor, sem tabela própria, igual ao Fluxo de Caixa/Aging/Fechamento. Usa as
  categorias reais de `contas_receber`/`contas_pagar` (Fase 8) mais as mensalidades de contrato
  vindas de `pagamentos`; não reproduz linhas fictícias do protótipo antigo (impostos, custo de
  mercadoria vendida) que não têm nenhum dado real por trás. Mostra sempre o mês atual, sem
  seletor de competência (mesmo padrão do "Fechamento de caixa", que também não tem um).

## Design

Segue fielmente o design system da Canaã (`design-system/`, publicado em
`https://backoffice.funerariacanaa.com/design-system/`): paleta azul, tipografia única
Plus Jakarta Sans, cards arredondados, sidebar dupla (trilho de ícones + painel de labels),
badges semânticos e **tema claro fixo**.

- `src/styles/tokens.css` — cópia dos tokens do design system (fonte da verdade visual).
- `src/styles/app.css` — camada de componentes (botões, cards, tabelas, formulários, alertas,
  toasts, modais, timeline, aging, cena de autenticação, documentos para impressão)
  consumindo apenas os tokens.

### Componentes — Atomic Design

`src/components/` é organizado em `atoms/ → molecules/ → organisms/ → templates/`, com
barril único em `src/components/index.js`. Mapa completo em
[`src/components/README.md`](./src/components/README.md).

## Stack

- React 18 + Vite 5 + React Router 6 (`HashRouter`).
- JavaScript/JSX, sem dependências além de React e do roteador.
- Deploy do frontend: build estático (`npm run build`) publicado na Hostinger em
  `backoffice.funerariacanaa.com` (`base` relativo `./` no `vite.config.js`). Deploy do backend:
  arquivos de `server/` sobem por SSH para `.../backoffice/api/` (sem build — PHP puro).

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:5173/
npm run build    # gera dist/
npm run preview  # serve o build
```

## Módulos

| Grupo | Módulos |
|---|---|
| **Núcleo** | Painel, Clientes, Parceiros, Registro de Óbito, Guias de Atendimento |
| **Financeiro** | Planos e contratos, Gerador de Carnês, Pagamento Integrado, Controle Financeiro |
| **Operação** | Empréstimo de Equipamentos, Vendas de Equipamentos, Cadastro de Equipamentos, Notas Fiscais |
| **Expansão** | Leads do Site, Portal do Parceiro |
| **Configurações** | Unidades, Planos, Backup, Usuários (perfis/permissões e parâmetros ficam na aba de Usuários) |

Profundidade: **Painel, Clientes, Óbitos, Guias, Planos e Financeiro** têm listagem + detalhe +
formulários; os demais têm listagem funcional + detalhe/drawer.

O seletor de perfil na barra superior (Administrador, Atendente, Financeiro, Operacional,
Parceiro comercial) altera o menu e o conteúdo — o perfil Parceiro enxerga apenas o Portal do Parceiro.

## Observações

- Em **Clientes, Parceiros, Unidades, Usuários, Planos, Contratos, na baixa manual de
  Pagamentos, em Registro de Óbito + Guias de Atendimento, em Equipamentos (Cadastro,
  Empréstimo e Vendas), em Notas Fiscais, em Portal do Parceiro + Carnês, em Controle
  Financeiro (incluindo DRE gerencial), em Perfis-Permissões/Backup e em Leads do Site**,
  criar/editar/mudar status já persiste de verdade no banco (API própria) — os demais módulos
  (Conciliação bancária, Parâmetros, Auditoria, execução/restauração de Backup, envio de e-mail
  a cada novo lead) continuam em simulação: ações disparam um _toast_ de confirmação, sem gravar
  nada.
- Nas listagens ainda mockadas, o badge de status é clicável: abre os status pré-definidos da
  tela e troca o status da linha (só em memória, sem persistência). Nas listagens já migradas,
  a troca de status é uma chamada real à API (com rollback visual se falhar).
- Cadastro/edição de clientes, parceiros e registros de óbito abrem em pop-up sobre a
  página atual (lista ou ficha), sem navegar para uma rota separada.
- Os campos de seleção são pop-overs próprios do sistema (sem `<select>` nativo).
- CPF, CNPJ, RG, CEP, telefone e valores em R$ têm máscara de digitação (`src/lib/masks.js`).
  O CEP busca o endereço via ViaCEP: rua/bairro/cidade/UF ficam bloqueados enquanto a busca
  é bem-sucedida e destravam para preenchimento manual só se o CEP não for encontrado.
- Cadastro de cliente é um assistente de 3 pop-ups (titular → dependentes → contrato); titular,
  dependentes e, se um plano for escolhido na etapa 1, o contrato (com as 12 parcelas) são
  todos gravados no banco ao concluir — a etapa 3 mostra o aviso de "modelo de contrato ainda
  não cadastrado" só porque não existe modelo de PDF definido, não porque falte persistência.
- Registrar óbito é um assistente de 4 pop-ups (tipo/falecido → serviços → nota de
  falecimento → nota fiscal). Para atendimento "Plano", busca o contrato pelo titular e
  deixa escolher o titular ou um dependente real (com `codigo` próprio, `DEP-0001...`) como a
  pessoa falecida, puxando os dados. Ao concluir, óbito + serviços são gravados no banco numa
  transação, com a validação de cobertura calculada a partir do contrato/parcelas reais. A nota
  de falecimento é gerada como imagem (canvas, com a foto opcional) e pode ser baixada; a etapa
  de nota fiscal, se o valor cobrado for maior que zero, gera uma nota fiscal real vinculada ao
  óbito — sem cobrança à parte (tudo coberto pelo plano), nenhuma nota é necessária.
- Em Guias de Atendimento, "Gerar guia" busca o contrato pelo titular, deixa escolher o
  beneficiário (titular ou dependente) e o parceiro, grava a guia no banco (com o primeiro
  registro de histórico "Emitida") e mostra o PDF da guia para imprimir ou baixar. A troca de
  status segue o ciclo real (`Emitida → ... → Faturada`) com histórico gravado a cada mudança;
  cancelar exige uma justificativa (mínimo 10 caracteres), registrada em log de auditoria. Guias
  geradas por aqui não ficam vinculadas a um óbito (`obito_id` nulo) — o formulário nunca teve um
  seletor de "qual atendimento" para isso.
- "Configurações" agora tem seu próprio ícone no trilho de navegação, na ordem normal
  logo abaixo de "Expansão" (antes ficava isolado no rodapé). Reúne Unidades (lista real, com
  foto por unidade — sem bloco de empresa principal), Planos (catálogo real — cadastrar um
  plano aqui é pré-requisito para conseguir contratar um em Clientes ou em Planos → Contratar),
  Backup (config e histórico reais desde a Fase 9; execução/restauração seguem simuladas) e
  Usuários (lista real; criar/editar já define/atualiza a senha de acesso — a aba reúne também
  Perfis e permissões, real desde a Fase 9, e Parâmetros, que segue mockado; não há aba de
  "Empresa" separada — a empresa só tem Unidades/filiais, já cobertas acima).
- Em Pagamentos, "Baixa manual" busca o contrato real pelo titular, lista as parcelas reais em
  aberto do contrato (as já pagas somem da lista) e, ao confirmar, marca a parcela como paga de
  verdade e registra o pagamento — aparece na aba Conciliação com o badge "Baixa manual". A
  conciliação bancária automática (as demais linhas, "Fila de exceções" e "Log da API bancária")
  continua simulada. A lista de Conciliação também abre um pop-up com os dados do pagamento ao
  clicar na linha.
- Em Controle Financeiro, "Nova conta a pagar/receber" grava no banco de verdade; a opção
  "Conta recorrente" gera N lançamentos mensais reais numa transação, todos com o mesmo `lote`;
  categoria e centro de custo são pop-overs de seleção. Trocar o status de uma conta é uma
  chamada real à API — inclusive quando o rótulo mostra "Vencido" (calculado), o menu continua
  oferecendo Em aberto/Pago/Negociado.
- Em Empréstimo de Equipamentos, "Registrar saída" abre um catálogo com foto dos
  equipamentos disponíveis; escolher um leva ao formulário de dados do empréstimo, que grava a
  saída no banco e marca a unidade como "Emprestado" numa transação. "Devolver" marca a unidade
  de volta como "Disponível" e grava data/estado de devolução. As listas de empréstimos e do
  inventário mostram a foto do produto e o nº de inventário reais, e a lista de empréstimos abre
  um pop-up com os dados ao clicar na linha; a troca de status (inclusive "Atrasado", que fica
  manual, não calculado) é uma chamada real à API.
- Em Vendas de Equipamentos, "Nova venda" segue o mesmo catálogo com foto do equipamento; ao
  escolher o equipamento, informa se é cliente cadastrado (puxa nome/CPF/telefone/endereço) ou
  não (preenche à mão), grava a venda no banco e decrementa o estoque real do produto. A etapa
  "emitir nota fiscal agora ou depois" e o botão "Emitir NF-e" do drawer da venda geram uma nota
  fiscal real (`vendas_equipamento.nota_fiscal_id` passa a apontar para ela) — o botão fica
  desabilitado quando a venda já tem nota emitida.
- Cadastro de Equipamentos tem abas separadas para Venda (produto com preço/estoque) e Locação
  (produto + todos os números de inventário registrados de uma vez, numa única transação); ambos
  gravam no banco de verdade. Foto de produto continua `URL.createObjectURL` (blob local, não
  persiste entre recarregamentos) — gap conhecido desde a Fase 1, real upload de arquivo fica
  fora de escopo.
- Autenticação é **real** (token validado no servidor a cada carregamento); os módulos ainda
  não migrados continuam com dados de exemplo fixos em `src/mock/`.
- Data de referência do protótipo (para os módulos ainda mockados): **27/08/2026**.
- `design-system/`, `PRD.md` e `visual/` não são alterados por este frontend.
