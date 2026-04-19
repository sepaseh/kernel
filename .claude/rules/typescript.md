# TypeScript

## Use `type` for object shapes

```ts
// correct
type User = { id: string; name: string };

// avoid
interface User { id: string; name: string }
```

Reserve `interface` only for class contracts.

## Avoid `as` casts

Prefer type-safe narrowing over type assertions. Use `as` only at routing/parsing boundaries.

## Derive union types from const arrays

```ts
const THEMES = ["light", "dark"] as const;
type Theme = (typeof THEMES)[number];
```

## Pick over custom types when antd tokens are involved

Use `Pick<GlobalToken, "colorBgBase" | ...>` instead of defining parallel custom types.