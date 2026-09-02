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

## Prefer optional values over null

- Prefer not to use `null` in application code. Represent an absent value with
  an optional field, optional parameter, or `undefined` instead of a `null`
  union.
- Do not combine optional syntax with a nullable union such as
  `value?: string | null`; use `value?: string`.
- Prefer omission to `null` in API examples and request payloads when absence
  has no distinct domain meaning.
- Normalize nullable external response fields at the API boundary before they
  enter domain models or application state.
- Keep `null` only when it has a distinct domain or protocol meaning, or when a
  browser API or third-party library requires it. Keep that exception local to
  the boundary and do not spread its nullable type through the application.

## Shared types

- Keep domain types beside their owning feature in `src/features/<feature>/types.ts`.
- Keep infrastructure contracts beside the shared module that owns them.
- Keep permission contracts in `src/features/roles/types.ts`.

## Derive types from their source of truth

- When an existing domain or library type already owns a value's shape, derive
  the consumer type from it instead of repeating a primitive, union, object
  shape, or function signature manually.
- Use indexed access types such as `User["id"]` for domain fields and utility
  types such as `Parameters<>`, `ReturnType<>`, and `ComponentProps<>` when
  they keep consumers synchronized with the owning contract.
- Do not duplicate a type merely to make a local annotation shorter. Prefer a
  named derived alias when the inline expression would hurt readability.
- Define a standalone type when it represents a genuinely independent domain
  concept or public boundary; do not derive unrelated concepts solely because
  their current representations happen to match.

```ts
// Prefer
type DeleteUserId = User["id"];

// Avoid: this can silently diverge if the domain identifier changes.
type ManuallyTypedUserId = string;
```
