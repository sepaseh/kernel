# Code Quality

## Validate code changes

Run the smallest check that covers the files you changed, then broaden before handoff when practical.

- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Production build: `npm run build`
- Unused code check: `npm run knip`

For docs-only tasks, run `npm run format:check` and validate links and referenced
commands. Code-only checks such as lint, typecheck, and Knip are unnecessary
unless configuration or source files also changed.

## Autofix workflow

- Let ESLint handle import sorting and style object ordering.
- Use `npm run lint:fix` when safe to auto-fix formatting/lint issues.
- Never sort imports manually if ESLint can do it.
- Do not introduce a formatter or new tooling unless the user asks.

## Readable code over comments

Write self-documenting code. Add comments only for:

- Non-obvious business logic
- Algorithmic decisions that are not clear from the code
- Temporary workarounds with context

## Semantic whitespace

- Treat a blank line as a paragraph boundary between conceptually distinct
  parts of the code, not as decoration between individual statements.
- Leave one blank line after guard clauses before the main execution path.
- Keep consecutive steps of one workflow together, including setup, derived
  values, branching, and their related success effects.
- Add a blank line only when the code changes responsibility or begins an
  independently meaningful phase. If a function needs many such phases,
  consider extracting a focused helper instead of adding more visual sections.

## Simplicity

- Solve the current task directly; avoid speculative abstractions.
- Keep starter-kit code generic and easy to replace.
- Do not add error handling for impossible states.
- Prefer straightforward repetition over premature abstraction.

## No unused code

- Remove unused files, exports, dependencies, translations, and routes.
- Prefer `npm run knip` for cleanup verification.
