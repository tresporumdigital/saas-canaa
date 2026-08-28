# Biblioteca de componentes — Atomic Design

Estrutura baseada no *Atomic Design* de Brad Frost. Cada camada só depende das
camadas abaixo dela. Importe sempre pelo barril `src/components/index.js`:

```js
import { Button, Field, DataTable, PageHeader } from '../../components/index.js';
```

## Camadas

### `atoms/` — blocos indivisíveis
Sem estado de negócio, sem layout de página.
`Icon`, `IconSprite`, `Button`, `Card`, `Badge`, `Tag`, `Avatar`,
`Bar`, `Spark`, `Skeleton`, `Spinner`, `Divider`.

### `molecules/` — grupos pequenos de átomos
`Field` (+ `Input`, `PasswordInput`, `Select`, `Textarea`, `Checkbox`, `Radio`, `FieldRow`),
`DefList`, `AvatarGroup`, `StatCard`, `Alert`, `EmptyState`, `Breadcrumb`,
`Pagination`, `SkeletonRows`.

### `organisms/` — seções completas e autônomas
`DataTable`, `StatusMenu`, `Modal`/`ConfirmDialog`, `Drawer`, `Tabs`, `Domain` (`Timeline`,
`CoverageBanner`, `AgingBars`, `PrintDocument`), `PageHeader`, `NavRail`,
`NavPanel`, `MobileNav`, `TopBar`, `RoleSwitcher`, `UserMenu`, `RequireAuth`,
`auth/LoginForm`.

`StatusMenu` transforma o badge de status das listagens em botão: abre os status
pré-definidos daquela página (`STATUS_SETS` em `src/lib/status.js`) e troca o status
da linha. A troca fica só em memória, via o hook `src/hooks/useRowStatus.js`.

### `templates/` — esqueleto de página, sem dados reais
`AppLayout` (casca autenticada: trilho + painel + topo + conteúdo),
`AuthLayout` (cena de login/cadastro: coluna de marca + painel do formulário).

### Páginas — `src/pages/`
Instâncias concretas das templates com dados (mockados). Ex.: `pages/auth/AuthPage`,
`pages/dashboard/Dashboard`.

## Regras

- **Tokens são a única fonte de cor.** Componentes usam apenas classes de
  `src/styles/app.css`, que por sua vez só consome variáveis de `src/styles/tokens.css`.
- Um componente nunca importa de uma camada acima nem de `src/pages`.
- Novos componentes entram na camada mais baixa que comporta sua responsabilidade
  e são reexportados no barril.
