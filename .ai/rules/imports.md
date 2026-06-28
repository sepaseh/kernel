# Import Paths

## Rule

- Use `./` for imports within the same directory.
- Use `@/` for imports that cross directory boundaries.
- Do not use `../` imports inside `src`.

## Examples

```ts
// Same directory: src/api/auth.ts importing src/api/instance.ts
import { apiClient } from "./instance";

// Cross directory: src/pages/Users.tsx importing src/api/index.ts
import { fetchUsers } from "@/api";
```

## Enforcement

Custom ESLint rules in `eslint.config.ts` enforce this automatically:

- `local/no-parent-relative-imports` bans `../` imports.
- `local/no-alias-for-same-dir` bans `@/` for same-directory imports.

Import ordering is handled by `eslint-plugin-simple-import-sort`.
