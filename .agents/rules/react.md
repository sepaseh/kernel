# React

## Components

- Keep one exported React component per `.tsx` file when practical.
- When a function component receives props, define them as a named `type` and
  apply it to the component as `FC<Props>` instead of annotating the
  destructured parameter directly. Do not add `FC` to components without
  props; let TypeScript infer their return type.
- Put reusable UI pieces in `src/shared/ui`.
- Keep route-level screens in their owning `src/features/<feature>` directory.
- Keep feature-specific forms beside the owning feature.
- Do not define React components inside another component render body.

```tsx
import type { FC } from "react";

type UserCardProps = {
  name: string;
};

export const UserCard: FC<UserCardProps> = ({ name }) => <div>{name}</div>;
```

## State and hooks

- Reusable components receive data through props.
- Page/domain components may read app state through hooks.
- Move state down when only a small part of the tree needs it.
- Place `useMemo` declarations after state, context, and other base values but
  before event handlers and helper functions. If a memo depends on a locally
  declared function, place it immediately after that dependency. Do not place
  memo declarations between otherwise related handlers.
- Inside a component, declare event handlers and helper functions before its
  `useEffect` calls. Keep effects together after those functions and before
  early returns or JSX, while ensuring hooks remain unconditional.
- Derive values inline instead of syncing derived state with `useEffect`.
- Avoid `useMemo` and `useCallback` unless they solve a real dependency or performance problem.

## Forms

- Type Ant Design submit handlers as `FormProps<Values>["onFinish"]`.
- Put the asynchronous submit logic directly in that handler. Do not add a
  `NonNullable` wrapper or a second callback whose only job is to discard the
  handler promise with `void`.

## Rendering patterns

- Use `condition && <Content />` when `condition` is typed as `boolean`. Use a
  ternary with `null` for numbers, strings, and other truthy/falsy values so
  values such as `0` or an empty string cannot leak into rendered output. Do
  not use patterns such as `items.length && ...` because they can render `0`.
- Use `key` to intentionally reset component state when switching between similar forms or records.
- Avoid spreading large domain objects into components; pass only the props the component needs.
- Use `Map` or object lookups for repeated render-path lookups instead of repeated `Array.find` calls.

## Ant Design tables

- In table column renderers, do not consume the first `value` argument derived
  from `dataIndex`. Ignore it and destructure the required field from the row
  record instead. This keeps the rendered value explicit and consistently
  tied to the typed record.
- Use the product's intended empty-value fallback when reading the record. For
  text cells that should treat both `null` and an empty string as missing, use
  `|| "-"`.

```tsx
// Prefer
{
  dataIndex: "mobile",
  render: (_, { mobile }) => mobile || "-",
}

// Avoid
{
  dataIndex: "mobile",
  render: (value: string | null) => value ?? "-",
}
```

## Translations

All user-visible text should go through `react-i18next`.

- Add English strings to `src/shared/i18n/locales/en.ts`.
- Add Persian strings to `src/shared/i18n/locales/fa.ts` when the translation is known.
- Keep locale keys alphabetized.
- Use i18next pluralization for count-based strings.

## Icons

- Import and render the specific local icon component at call sites; do not
  render emoji, route icons through a name-based wrapper, or import an icon
  package directly into feature components.
- Keep each SVG icon as a local component beside `SvgIcon`. Copy only the required
  Material UI SVG path from `@mui/icons-material`; do not add MUI as a runtime
  dependency solely for icons.
- Render SVGs with `currentColor` so color follows the surrounding control, and
  keep decorative icons hidden from assistive technology. The owning button or
  control must provide its accessible name.

## Routing

- Define route keys and paths in `src/app/config/routes.ts`.
- Update `src/app/config/routes.ts` when route access changes. Keep access
  decisions in the pure policy functions under `src/app/lib`.
