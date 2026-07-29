# TypeScript

## Object shapes

Use `type` for object shapes.

```ts
// Prefer
type User = { id: string; name: string };

// Avoid
interface User {
  id: string;
  name: string;
}
```

Reserve `interface` for class contracts or external declaration merging.

## Type safety

- Prefer narrowing over `as` casts.
- Use `as` only at boundaries such as route keys, parser output, or third-party APIs.
- Avoid `any` unless the surrounding code already requires it.
- Do not add optional chaining or fallback values for values whose types are non-optional.

## Literal unions and configs

Derive unions from const values when it keeps types and runtime data in sync.

```ts
const themes = ["light", "dark"] as const;
type Theme = (typeof themes)[number];
```

Use `satisfies` for config objects when you want type validation without losing literal types.

```ts
const routes = {
  auth: { path: "/auth" },
  root: { path: "/" },
} as const satisfies Record<string, { path: string }>;
```

## Exhaustiveness

Prefer `Record<Union, Value>` for finite mappings so TypeScript forces every case to be handled.

```ts
type Status = "active" | "inactive";

const statusLabel: Record<Status, string> = {
  active: "Active",
  inactive: "Inactive",
};
```

## Runtime validation

Fail fast for required internal values, but validate untrusted external data before trusting it.

- Required internal state/config: throw clearly when missing.
- API/user input: validate or normalize at the boundary.
- Truly optional data: handle explicitly without pretending it is required.

## Shared types

- Keep API/domain types in `src/types`.
- Export shared types from `src/types/index.ts`.
- Keep permission keys in `src/types/permission.ts`.
