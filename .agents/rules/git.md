# Git Workflow

Use this guidance only when the user asks to commit, inspect history, or prepare changes for version control.

## Before committing

1. Run `git status`.
2. Review the relevant `git diff`.
3. Run the complete local CI suite and confirm every command passes:

   ```bash
   npm run audit
   npm run typecheck
   npm run lint
   npm run format:check
   npm run test:coverage
   npm run test:contract
   npm run knip
   npm run performance
   npm run build-storybook
   npm run test:storybook
   npm run test:e2e -- --project=chromium
   ```

4. Do not stage or create a commit when any required check fails or cannot run.
   Report the blocker and wait for explicit user direction before making an
   exception.
5. Stage only the files that belong to the requested change.
6. Use a concise commit message with a first line under 72 characters.

## Rules

- Do not commit unless the user explicitly asks.
- Do not push unless the user explicitly asks.
- Avoid `git add .` or `git add -A` unless the user asks for a broad commit.
- Never commit `.env`, credentials, build output, or local-only settings.
- Never use `--no-verify` unless the user explicitly asks.
- Never force-push to `main` or `master`.
- Do not add AI co-author trailers unless the user asks for one.
