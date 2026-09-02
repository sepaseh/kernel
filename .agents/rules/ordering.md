# Ordering

Sort alphabetically wherever order has no semantic meaning.

## Apply to

- Object keys
- Type fields
- Type declarations within `types.ts` files
- Component props
- Named exports in index files
- Translation keys
- Array items when order does not affect behavior

Imports are sorted automatically by ESLint. Do not manually fight the sorter.

## Example

```ts
// Prefer
type User = {
  email: string;
  id: string;
  name: string;
};

// Avoid
type User = {
  id: string;
  name: string;
  email: string;
};
```
