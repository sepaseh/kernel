# Import Paths

## Rule

- Use `./` for imports within the **same directory** (sibling files)
- Use `@/` for imports that cross directory boundaries

## Examples

```ts
// src/ui/styles.ts importing from src/ui/Stack.ts — same dir → use ./
import { CSSProperties } from "./Stack";

// src/pages/NotFound.tsx importing from src/ui/Stack.ts — cross dir → use @/
import { Stack } from "@/ui/Stack";
```

## Enforcement

Two custom inline rules in `eslint.config.js` enforce this automatically:

- `local/no-parent-relative-imports` — bans `../` (use `@/` instead)
- `local/no-alias-for-same-dir` — bans `@/` when the import resolves to the same directory (use `./` instead)
