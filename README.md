# react-base

A clean React starter template. Fork this to begin new projects.

## Stack

| Layer | Library |
|---|---|
| UI framework | React 19 + TypeScript |
| Build tool | Vite |
| Component library | Ant Design 6 |
| Styling | styled-components 6 |
| Data fetching | TanStack Query 5 |
| Routing | react-router-dom 7 |
| i18n | i18next + react-i18next |
| HTTP | axios |
| Formatting | Prettier |

## Theme system

Ant Design is the single source of truth for theming. `TokenBridge` (inside `AntdProvider`) reads `theme.useToken()` and injects the computed `GlobalToken` into styled-components `ThemeProvider`. This means styled-components has access to all Ant Design tokens via `useTheme()`.

Palette colors are defined in `src/config/theme.ts` as `Pick<GlobalToken, ...>`.

```ts
const token = useTheme(); // GlobalToken
token.colorPrimary;
token.colorBgBase;
```

## Provider hierarchy

```
QueryProvider
  └── CoreProvider
        └── AntdProvider (TokenBridge → ThemeProvider)
              └── Routes
```

## Project structure

```
src/
  api/          # axios clients
  config/       # constants, language, routes, theme
  hooks/        # reusable hooks
  icons/        # SVG icon components
  layouts/      # Auth, Default
  locales/      # i18n translation files (en, es, pt, it, de, hr)
  pages/        # route page components
  providers/    # React context providers
  storage/      # localStorage helpers
  styles/       # global CSS
  types/        # shared TypeScript types
  ui/           # base UI components (Button, Divider, Stack/HStack/VStack)
  utils/        # utility functions
```

## Commands

```bash
npm run dev        # start dev server
npm run build      # typecheck + build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run lint:fix   # eslint --fix (auto-sorts style props)
npm run test       # vitest
npm run knip       # detect unused exports and dependencies
```

## ESLint rules

Three custom inline rules live in `eslint.config.js` under the `local/` namespace — no extra dependencies required.

**`local/no-parent-relative-imports`** — bans `../` imports; use `@/` instead.

**`local/no-alias-for-same-dir`** — bans `@/` when the target is in the same directory; use `./` instead.

**`local/style-props-recess-order`** — enforces recess property order on `$style`, `$before`, `$after`, `$hover`, `$focus` props. Auto-fixable with `npm run lint:fix`.

## Import paths

```ts
// same directory → ./
import { helper } from "./utils";

// cross-directory → @/
import { Stack } from "@/ui/Stack";
```

## Styling

Use `Stack`, `HStack`, `VStack` from `@/ui/Stack` for layout. Pass styles through props:

```tsx
<Stack
  $style={{ display: "flex", gap: "8px" }}
  $hover={{ opacity: "0.8" }}
/>
```

Style props follow recess order (enforced by ESLint):
`content` → positioning → box model → flex/grid → border → background/color → typography → ui → svg → transform/animation

## Environment variables

Copy `.env.example` to `.env.local` (gitignored) and fill in values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL for the API client |

Types are declared in `src/vite-env.d.ts`.

## i18n

All user-visible strings go through `useTranslation`. Add new keys to `src/locales/en.ts` only — other languages are translated separately.
