# Sistema de Gestão Funerária Canaã — Frontend + Backend

Frontend navegável do ERP descrito em [`PRD.md`](./PRD.md). Com as Fases 1 e 2 do backend, os
módulos **Clientes, Parceiros, Unidades, Usuários** (+ login) e **Planos (catálogo), Contratos
e Parcelas** são reais, com API própria em PHP/PDO (`server/`, publicada em `/api/`) e banco
MySQL/MariaDB na Hostinger — sem dado de exemplo pré-carregado, é um banco de produção mesmo.
Os demais módulos (Carnês, Pagamentos, Financeiro, Óbitos, Guias, Equipamentos, Notas Fiscais,
Leads, Portal do Parceiro etc.) ainda são **mockados** em `src/mock/` (referências cruzadas
consistentes entre si) até serem migrados em fases seguintes.

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
- Códigos gerados (`CLI-`, `PAR-`, `CTR-2026-`...) para entidades cujo id ainda é referenciado
  por módulos mockados começam num número alto (ex.: contratos reais começam em `CTR-2026-1001`)
  para nunca colidir com os ids fictícios `0001..0020` usados nos mocks ainda não migrados.

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

- Em **Clientes, Parceiros, Unidades, Usuários, Planos e Contratos**, criar/editar/mudar status
  já persiste de verdade no banco (API própria) — os demais módulos continuam em simulação:
  ações disparam um _toast_ de confirmação, sem gravar nada.
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
  deixa escolher o titular ou um dependente como a pessoa falecida, puxando os dados.
  A nota de falecimento é gerada como imagem (canvas, com a foto opcional) e pode ser
  baixada; a nota fiscal pode ficar para depois.
- Em Guias de Atendimento, "Gerar guia" busca o contrato pelo titular, deixa escolher o
  beneficiário (titular ou dependente) e o parceiro, cria a guia na lista (só em memória)
  e mostra o PDF da guia para imprimir ou baixar.
- "Configurações" agora tem seu próprio ícone no trilho de navegação, na ordem normal
  logo abaixo de "Expansão" (antes ficava isolado no rodapé). Reúne Unidades (lista real, com
  foto por unidade — sem bloco de empresa principal), Planos (catálogo real — cadastrar um
  plano aqui é pré-requisito para conseguir contratar um em Clientes ou em Planos → Contratar),
  Backup (mockado) e Usuários (lista real; criar/editar já define/atualiza a senha de acesso).
- Em Pagamentos, "Baixa manual" busca o contrato real pelo titular e lista as parcelas reais
  do contrato; ao escolher uma, preenche o valor e sugere a data — confirmar a baixa ainda é só
  um toast (marcar a parcela como paga de verdade fica para uma fase futura). A lista de
  Conciliação também abre um pop-up com os dados do pagamento ao clicar na linha.
- Em Controle Financeiro, "Nova conta a pagar" tem a opção de marcar como recorrente
  (gera N lançamentos mensais); categoria e centro de custo são pop-overs de seleção.
- Em Empréstimo de Equipamentos, "Registrar saída" abre um catálogo com foto dos
  equipamentos disponíveis; escolher um leva ao formulário de dados do empréstimo. As
  listas de empréstimos e do inventário mostram a foto do produto e o nº de inventário,
  e a lista de empréstimos abre um pop-up com os dados ao clicar na linha.
- Em Vendas de Equipamentos, "Nova venda" segue o mesmo catálogo com foto do empréstimo;
  ao escolher o equipamento, informa se é cliente cadastrado (puxa nome/CPF/telefone/
  endereço) ou não (preenche à mão), e ao confirmar pergunta se quer emitir a nota fiscal
  agora ou depois — quando emitida, o toast indica que foi enviada para o Financeiro.
- Cadastro de Equipamentos tem abas separadas para Venda (produto com preço/estoque) e
  Locação (produto + todos os números de inventário registrados de uma vez); ambos com foto.
- Autenticação é **real** (token validado no servidor a cada carregamento); os módulos ainda
  não migrados continuam com dados de exemplo fixos em `src/mock/`.
- Data de referência do protótipo (para os módulos ainda mockados): **27/08/2026**.
- `design-system/`, `PRD.md` e `visual/` não são alterados por este frontend.
