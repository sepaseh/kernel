# Import Paths

## Rule

- Use `./` for imports within the same directory.
- Use `@/` for imports that cross directory boundaries.
- Do not use `../` imports inside `src`.

## Examples

```ts
// Same directory: src/features/users/Users.tsx importing its API
import { fetchUsers } from "./api";

// Cross directory: a feature importing shared infrastructure
import { apiClient } from "@/shared/api";
```

## Enforcement

Custom ESLint rules in `eslint.config.ts` enforce this automatically:

- `local/no-parent-relative-imports` bans `../` imports.
- `local/no-alias-for-same-dir` bans `@/` for same-directory imports.

Import ordering is handled by `eslint-plugin-simple-import-sort`.
