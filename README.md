# Sistema de Gestão Funerária Canaã — Frontend

Frontend navegável do ERP descrito em [`PRD.md`](./PRD.md), construído para **validação visual do produto e das jornadas**.
Sem backend e sem banco de dados: **todos os dados são mockados** em `src/mock/` (referências cruzadas consistentes entre clientes, contratos, óbitos, guias, parceiros etc.).

**Online:** https://tresporumdigital.github.io/saas-canaa/

## Design

Segue fielmente o design system da Canaã (`design-system/`, publicado em
`https://backoffice.funerariacanaa.com/design-system/`): paleta azul, tipografia única
Plus Jakarta Sans, cards arredondados, sidebar dupla (trilho de ícones + painel de labels),
badges semânticos e **tema claro fixo**.

- `src/styles/tokens.css` — cópia dos tokens do design system (fonte da verdade visual).
- `src/styles/app.css` — camada de componentes (botões, cards, tabelas, formulários, alertas,
  toasts, modais, timeline, aging, documentos para impressão) consumindo apenas os tokens.

## Stack

- React 18 + Vite 5 + React Router 6 (`HashRouter`).
- JavaScript/JSX, sem dependências além de React e do roteador.
- Deploy: GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`).

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:5173/saas-canaa/
npm run build    # gera dist/
npm run preview  # serve o build
```

## Módulos (todos com dados mockados)

| Grupo | Módulos |
|---|---|
| **Núcleo** | Painel, Clientes, Parceiros, Registro de Óbito, Guias de Atendimento, Backups |
| **Receita** | Planos e contratos, Gerador de Carnês, Pagamento Integrado, Controle Financeiro |
| **Operação** | Empréstimo de Equipamentos, Vendas de Equipamentos, Notas Fiscais |
| **Expansão** | Leads do Site, Portal do Parceiro |
| **Config** | Usuários, Perfis e Permissões, Parâmetros |

Profundidade: **Painel, Clientes, Óbitos, Guias, Planos e Financeiro** têm listagem + detalhe +
formulários; os demais têm listagem funcional + detalhe/drawer.

O seletor de perfil na barra superior (Administrador, Atendente, Financeiro, Operacional,
Parceiro comercial) altera o menu e o conteúdo — o perfil Parceiro enxerga apenas o Portal do Parceiro.

## Observações

- Ações de criar/editar/emitir **não persistem** — disparam um _toast_ de confirmação.
- Data de referência do protótipo: **27/08/2026**.
- `design-system/`, `PRD.md` e `visual/` não são alterados por este frontend.
