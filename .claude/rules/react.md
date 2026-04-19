# React

## One component per file

Each `.tsx` file exports one React component.

## State and hooks

- Domain-specific components read state from hooks directly.
- Reusable UI components receive data as props.

## Translations

All user-visible text must go through the `useTranslation` hook (`react-i18next`).

Add new strings to `src/locales/en.ts` only — other languages are translated separately.

## No manual memoization

Don't add `useMemo`/`useCallback` unless there is a measured performance problem.