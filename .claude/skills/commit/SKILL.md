# Commit

Stage, commit, and optionally push changes.

## Steps

1. Run `git status` and `git diff` to review changes.
2. Stage specific files — never use `git add .` or `git add -A`.
3. Write a concise commit message (under 72 chars for the first line).
4. Include the co-author trailer:
   ```
   Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
   ```
5. Push only if the user explicitly asks.

## Rules

- Never use `--no-verify`
- Never commit `.env` or credential files
- Never force-push to main/master