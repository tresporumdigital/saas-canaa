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
| **Núcleo** | Painel, Clientes, Parceiros, Registro de Óbito, Guias de Atendimento, Backups |
| **Receita** | Planos e contratos, Gerador de Carnês, Pagamento Integrado, Controle Financeiro |
| **Operação** | Empréstimo de Equipamentos, Vendas de Equipamentos, Cadastro de Equipamentos, Notas Fiscais |
| **Expansão** | Leads do Site, Portal do Parceiro |
| **Config** | Usuários, Perfis e Permissões, Parâmetros, Empresa e Unidades |

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
- Em Guias de Atendimento, "Gerar guia" abre um pop-up para escolher cliente + parceiro
  e cria a guia na lista (só em memória).
- Autenticação é **mock** (sem backend); a sessão vive só no navegador.
- Data de referência do protótipo: **27/08/2026**.
- `design-system/`, `PRD.md` e `visual/` não são alterados por este frontend.
