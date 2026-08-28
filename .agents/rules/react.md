# React

## Components

- Keep one exported React component per `.tsx` file when practical.
- Put reusable UI pieces in `src/shared/ui`.
- Keep route-level screens in their owning `src/features/<feature>` directory.
- Keep feature-specific forms beside the owning feature.
- Do not define React components inside another component render body.

## State and hooks

- Reusable components receive data through props.
- Page/domain components may read app state through hooks.
- Move state down when only a small part of the tree needs it.
- Derive values inline instead of syncing derived state with `useEffect`.
- Avoid `useMemo` and `useCallback` unless they solve a real dependency or performance problem.

## Rendering patterns

- Use ternaries with `null` for conditional rendering; avoid `items.length && ...` because it can render `0`.
- Use `key` to intentionally reset component state when switching between similar forms or records.
- Avoid spreading large domain objects into components; pass only the props the component needs.
- Use `Map` or object lookups for repeated render-path lookups instead of repeated `Array.find` calls.

## Translations

All user-visible text should go through `react-i18next`.

- Add English strings to `src/shared/i18n/locales/en.ts`.
- Add Persian strings to `src/shared/i18n/locales/fa.ts` when the translation is known.
- Keep locale keys alphabetized.
- Use i18next pluralization for count-based strings.

## Routing

- Define route keys and paths in `src/app/config/routes.ts`.
- Update `src/app/config/routes.ts` when route access changes. Keep access
  decisions in the pure policy functions under `src/app/lib`.
