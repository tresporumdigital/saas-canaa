# Sistema de Gestão Funerária Canaã — Frontend

Frontend navegável do ERP descrito em [`PRD.md`](./PRD.md), construído para **validação visual do produto e das jornadas**.
Sem backend e sem banco de dados: **todos os dados são mockados** em `src/mock/` (referências cruzadas consistentes entre clientes, contratos, óbitos, guias, parceiros etc.).

**Online:** https://backoffice.funerariacanaa.com/

## Acesso (mock)

O sistema abre na **tela de login** (`#/login`). Sem sessão, qualquer rota interna
redireciona para lá.

- **Entrar** apenas com e-mail e senha — qualquer valor é aceito (não há validação real).
- **Sem cadastro e sem login social** nesta tela: as contas são criadas por um
  administrador. O backend cuidará disso futuramente.
- A sessão fica em `localStorage` (`canaa.auth`) só para sobreviver a um reload; "Sair"
  fica no menu do usuário (topo) e no drawer mobile.

Quando o backend existir, basta trocar `login` em `src/context/AuthContext.jsx`.

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
- Deploy: build estático (`npm run build`) publicado na Hostinger em
  `backoffice.funerariacanaa.com` (`base` relativo `./` no `vite.config.js`).

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:5173/
npm run build    # gera dist/
npm run preview  # serve o build
```

## Módulos (todos com dados mockados)

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

- Ações de criar/editar/emitir **não persistem** — disparam um _toast_ de confirmação.
- Nas listagens, o badge de status é clicável: abre os status pré-definidos daquela
  tela e troca o status da linha (só em memória, sem persistência).
- Cadastro/edição de clientes, parceiros e registros de óbito abrem em pop-up sobre a
  página atual (lista ou ficha), sem navegar para uma rota separada.
- Os campos de seleção são pop-overs próprios do sistema (sem `<select>` nativo).
- CPF, CNPJ, RG, CEP, telefone e valores em R$ têm máscara de digitação (`src/lib/masks.js`).
  O CEP busca o endereço via ViaCEP: rua/bairro/cidade/UF ficam bloqueados enquanto a busca
  é bem-sucedida e destravam para preenchimento manual só se o CEP não for encontrado.
- Cadastro de cliente é um assistente de 3 pop-ups (titular → dependentes → contrato); o
  contrato ainda não tem modelo definido, então essa etapa mostra um aviso no lugar do PDF.
- Registrar óbito é um assistente de 4 pop-ups (tipo/falecido → serviços → nota de
  falecimento → nota fiscal). Para atendimento "Plano", busca o contrato pelo titular e
  deixa escolher o titular ou um dependente como a pessoa falecida, puxando os dados.
  A nota de falecimento é gerada como imagem (canvas, com a foto opcional) e pode ser
  baixada; a nota fiscal pode ficar para depois.
- Em Guias de Atendimento, "Gerar guia" busca o contrato pelo titular, deixa escolher o
  beneficiário (titular ou dependente) e o parceiro, cria a guia na lista (só em memória)
  e mostra o PDF da guia para imprimir ou baixar.
- "Configurações" agora tem seu próprio ícone no trilho de navegação, na ordem normal
  logo abaixo de "Expansão" (antes ficava isolado no rodapé). Reúne Unidades (sem bloco
  de empresa principal — só a lista, com foto por unidade), Planos (cadastro dos planos
  oferecidos), Backup e Usuários (com pop-up de novo usuário).
- Em Pagamentos, "Baixa manual" busca o contrato pelo titular e, ao escolher a parcela,
  preenche o valor e sugere a data; a lista de Conciliação também abre um pop-up com os
  dados do pagamento ao clicar na linha.
- Em Controle Financeiro, "Nova conta a pagar" tem a opção de marcar como recorrente
  (gera N lançamentos mensais); categoria e centro de custo são pop-overs de seleção.
- Em Empréstimo de Equipamentos, "Registrar saída" abre um catálogo com foto dos
  equipamentos disponíveis; escolher um leva ao formulário de dados do empréstimo. As
  listas de empréstimos e do inventário mostram a foto do produto e o nº de inventário,
  e a lista de empréstimos abre um pop-up com os dados ao clicar na linha.
- Autenticação é **mock** (sem backend); a sessão vive só no navegador.
- Data de referência do protótipo: **27/08/2026**.
- `design-system/`, `PRD.md` e `visual/` não são alterados por este frontend.
