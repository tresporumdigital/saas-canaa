# Design System — Funerária Canaã

Sistema visual do backoffice administrativo da Funerária Canaã. Segue fielmente a referência em `/visual`: paleta azul em gradiente, cards brancos bem arredondados, sidebar com trilho de ícones + painel de labels, badges de status coloridos e uma única família tipográfica sans-serif.

## Arquivos

- `tokens.css` — variáveis CSS (custom properties). Tema único: claro, fixo.
- `tokens.json` — os mesmos tokens em JSON, para consumo programático (ex.: `tailwind.config`).
- `style-guide.html` — fonte do guia vivo (fragmento, sem `<!DOCTYPE>`/`<html>`/`<body>` — é isso que o publicador de Artifact exige). Amostras de cor/tipografia, prévia do painel, Estilo Premium, efeitos e animações.
- `build-deploy.sh` — empacota `style-guide.html` num documento HTML completo e válido (`dist/index.html`) para publicação real (Hostinger), com `<!DOCTYPE html>`, `<html lang="pt-BR">` e `<meta charset="UTF-8">` — ver "Publicação" abaixo.

## Publicado em

`https://backoffice.funerariacanaa.com/design-system/` — não na raiz do subdomínio (a raiz fica livre para a aplicação real quando o backend existir).

## Cor

| Token | Hex | Uso |
|---|---|---|
| `--canaa-navy-800` | `#16225E` | Texto principal, fim do gradiente de cena |
| `--canaa-blue-500` | `#2F6FEE` | Acento primário (botões, ativos, progresso, FAB) |
| `--canaa-sky-300` | `#6FC6F6` | Início do gradiente de cena, destaques claros |
| `--canaa-success-500` | `#22C55E` | Concluído / confirmado |
| `--canaa-warning-500` | `#F5A524` | Pendente / percentual em andamento |
| `--canaa-danger-500` | `#EF4444` | Urgente / cancelado |
| `--canaa-info-500` | `#17A6C7` | Informativo (ícones secundários) |
| `--color-bg` | `#EEF4FC` | Fundo da área de conteúdo do app |

`--gradient-scene` é o gradiente diagonal (`#6FC6F6 → #2F6FEE → #131C4E`) usado no pano de fundo decorativo/hero — não no conteúdo real das telas, que usa `--color-bg` (claro, neutro) para legibilidade.

## Tipografia

Fonte única: **Plus Jakarta Sans**, do logo aos rótulos de tabela — hierarquia por peso (400/500/600/700/800) e tamanho, não por família. Escala de `--text-xs` (0.75rem) a `--text-3xl` (2.75rem), ver `tokens.css`.

## Componentes-chave (como na referência)

- **Sidebar dupla**: trilho de ícones (`--color-nav-rail-*`, mais escuro) + painel de labels (`--color-nav-panel-*`, mais claro), item ativo em pílula branca.
- **Cards**: fundo branco, `--radius-lg` (24px), `--shadow-sm`/`--shadow-md`.
- **Badges de status**: pílula com ponto colorido, cores semânticas (`success`/`warning`/`danger`/`info`), nunca a cor de acento da marca.
- **Botão de ação flutuante (FAB)**: círculo `--color-accent`, `--shadow-lg`, canto inferior direito.
- **Ícones orbitais decorativos**: fileira de ícones circulares conectados por linhas finas acima do frame do app — usado só na cena de marca/hero, não em telas internas.

## Catálogo completo (`style-guide.html`)

Além da cena de marca, o guia documenta:

- **Escala**: espaço (base 4px), raio (`sm`/`md`/`lg`/`pill`) e três níveis de sombra.
- **Ícones**: biblioteca com ~18 glifos de traço único (1.8px, `currentColor`).
- **Botões**: `primary`/`secondary`/`ghost`/`danger`, tamanhos `sm`/`base`/`lg`, estado `disabled`, variante com ícone.
- **Formulários**: texto, select, textarea, checkbox, radio, e estados de validação `error`/`success` com texto de ajuda.
- **Badges, tags e avatares**: status semântico, etiqueta neutra (`tag-chip`), avatar com iniciais, grupo empilhado e indicador de status online.
- **Alertas**: banners `info`/`success`/`warning`/`danger` para contexto dentro da página.
- **Tabela de dados**: cabeçalho com ordenação, hover de linha, números tabulares, rodapé com paginação.
- **Navegação**: abas, breadcrumb, paginação.
- **Estados**: vazio (com call-to-action) e carregamento (skeleton com `prefers-reduced-motion` respeitado).
- **Sobreposições**: toast, menu suspenso, diálogo de confirmação (`--color-overlay` para o fundo).

Cada peça consome só os tokens de `tokens.css` — nenhuma cor literal fora deste arquivo.

## Estilo Premium, efeitos e animações

Adicionados a partir do catálogo de referência [pulseinovation.com.br/componentes](https://pulseinovation.com.br/componentes/), reconstruídos com os tokens da Canaã (não copiados) — ver seções "Estilo Premium", "Efeitos" e "Animações" em `style-guide.html`.

- **Estilo Premium**: adaptação clara do card "Dark Premium" da referência — a Canaã não adota fundo escuro, a sensação premium vem da textura e da profundidade (`--gradient-mesh`, `--gradient-border`, `--shadow-glow`, `--shadow-layered`), aplicadas em `.card-premium` / `.btn-premium`.
- **Efeitos** (utilitários isolados, reaproveitáveis fora do card Premium):
  - `--gradient-mesh` — textura de fundo (`.fx-mesh`)
  - `--gradient-border` — borda em gradiente via técnica padding-box/mask (`.fx-border`)
  - `--shadow-glow` — brilho colorido em elemento de destaque (`.fx-glow`)
  - `--shadow-layered` — elevação realista em múltiplas camadas (`.fx-layered`)
- **Animações** (classes `.anim-fade-up`, `.marquee`/`.marquee-track`, `.pulse-ring`/`.pulse-dot`, `.anim-shake`, `.reveal`/`.is-visible`; skeleton shimmer já documentado em "Estados"): todas desligam automaticamente sob `prefers-reduced-motion: reduce`. `scroll reveal` depende de `IntersectionObserver` (JS inline no fim de `style-guide.html`).

## Tema: claro, sempre

Decisão deliberada — o sistema **não** responde a `prefers-color-scheme` nem tem variante escura. `:root` define `color-scheme: light` para que o próprio navegador não escureça controles de formulário/scrollbar mesmo com o SO em modo escuro. Componentes devem consumir sempre os tokens (`var(--color-bg)` etc.), nunca cores literais — mas não há um segundo conjunto de valores por trás deles.

## Idioma e codificação

Para evitar tradução automática incorreta e caracteres acentuados quebrados em alguns navegadores, o documento publicado (`dist/index.html`, gerado por `build-deploy.sh`) sempre declara, nesta ordem, no início do `<head>`:

1. `<meta charset="UTF-8">` — primeiro que qualquer outra tag, evita que o navegador adivinhe a codificação errada (causa mais comum de acentuação/pontuação quebrada).
2. `<html lang="pt-BR">` — impede detecção de idioma incorreta e a tradução automática do navegador.
3. `<meta name="google" content="notranslate">` — opt-out explícito do Google Translate.

## Publicação (deploy)

```bash
bash design-system/build-deploy.sh
# gera design-system/dist/index.html + copia tokens.css/tokens.json
```

Depois envie `dist/index.html`, `tokens.css` e `tokens.json` para `.../public_html/backoffice/design-system/` no servidor (não para a raiz de `backoffice/`).

## Como usar em uma nova página/app

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/design-system/tokens.css">
```

Depois, estilizar componentes referenciando `var(--color-bg)`, `var(--font-sans)` etc. — nunca hex literal fora deste arquivo de tokens.
