# Git Workflow

Use this guidance only when the user asks to commit, inspect history, or prepare changes for version control.

## Before committing

1. Run `git status`.
2. Review the relevant `git diff`.
3. Stage only the files that belong to the requested change.
4. Use a concise commit message with a first line under 72 characters.

## Rules

- Do not commit unless the user explicitly asks.
- Do not push unless the user explicitly asks.
- Avoid `git add .` or `git add -A` unless the user asks for a broad commit.
- Never commit `.env`, credentials, build output, or local-only settings.
- Never use `--no-verify` unless the user explicitly asks.
- Never force-push to `main` or `master`.
- Do not add AI co-author trailers unless the user asks for one.
