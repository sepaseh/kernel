# Ordering

Sort alphabetically wherever possible:

- Object keys
- Type/interface fields
- Component props
- CSS properties in styled-components
- Array items (when order has no semantic meaning)
- Named exports in index files

Imports are handled automatically by ESLint (`eslint-plugin-simple-import-sort`) — do not sort them manually.

## Example

```ts
// correct
type User = {
  email: string;
  id: string;
  name: string;
};

const config = {
  borderRadius: 12,
  colorPrimary: "#2053df",
  fontFamily: "inherit",
};

// avoid
type User = {
  id: string;
  name: string;
  email: string;
};
```