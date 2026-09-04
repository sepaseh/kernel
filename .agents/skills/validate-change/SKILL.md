---
name: validate-change
description: Select and run Kernel checks for a change, including the complete gate at commit and push boundaries.
---

# Validate a change

Read the changed files and relevant rules before selecting checks.

- TypeScript or TSX: run `npm run typecheck`, then `npm run lint`.
- Behavior: run the smallest relevant test first.
- Documentation or guidance: run `npm run format:check` and check links and commands.
- Collection or backend work: run `npm run server:test` and affected contract tests.

Before every commit or push, run the complete gate in `CONTRIBUTING.md`. Never
bypass or silently ignore a failure.
