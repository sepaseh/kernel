# react-base

A React base template project. Clean foundation to start new projects from.

## Stack

- **React 19** + TypeScript + Vite
- **Ant Design 6** — UI components and single source of truth for theming
- **styled-components 6** — receives Ant Design tokens via `TokenBridge` in `AntdProvider`
- **TanStack Query 5** — data fetching and caching
- **react-router-dom 7** — routing
- **i18next** + react-i18next — multi-language (en, es, pt, it, de, hr)
- **axios** — HTTP client
- **Prettier** — code formatter

## Theme system

Ant Design is the single source of truth. `TokenBridge` (inside `AntdProvider`) reads `theme.useToken()` and passes the computed `GlobalToken` into styled-components `ThemeProvider`. styled-components `DefaultTheme` is augmented to extend `GlobalToken`.

Palette colors are defined as `Pick<GlobalToken, ...>` in `src/config/theme.ts` using plain hex values.

## Provider hierarchy

```
QueryProvider > CoreProvider > AntdProvider (TokenBridge → ThemeProvider) > Routes
```

## Project structure

```
src/
  api/          # axios clients
  config/       # constants, language, routes, theme
  hooks/        # reusable hooks
  icons/        # SVG icon components
  layouts/      # Auth, Default
  locales/      # i18n translation files
  pages/        # route page components
  providers/    # React context providers
  storage/      # localStorage helpers
  styles/       # global CSS (index.css, linked in index.html)
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
npm run test       # vitest
```

## Code style

- Use Prettier for formatting: `npx prettier --write <file>`
- No manual alignment of values with spaces
- Keep things simple — no over-engineering, no unnecessary abstractions
- Palette and shared color types use `Pick<GlobalToken, ...>` from antd
