# Code Quality

## Validate after every code change

Run `npm run typecheck` after modifying any code file.

- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Full check: `npm run build`

## Formatting

Always use Prettier — never manually align values with spaces.

- Single file: `npx prettier --write <path>`
- The post-edit hook handles this automatically.

## Simplicity

- No over-engineering. Only add what is needed for the current task.
- No docstrings, comments, or type annotations on code you didn't change.
- No error handling for scenarios that can't happen.
- Three similar lines of code is better than a premature abstraction.

## No unused code

Run `npm run knip` to detect unused exports, files, and dependencies.