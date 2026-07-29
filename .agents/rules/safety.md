# Safety

Use this guidance before running shell commands, editing sensitive files, or changing git state.

## Dangerous commands

Do not run destructive commands unless the user explicitly asks and the target path is verified.

- Avoid `git reset --hard`, `git clean -fd`, and force pushes.
- Avoid recursive delete/move commands against computed paths.
- Avoid deleting outside the current project unless explicitly requested.
- Prefer reviewing `git status` and `git diff` before broad edits.

## Secrets and credentials

- Do not read, print, commit, or edit secrets unless the user explicitly asks.
- Treat `.env`, private keys, credential files, tokens, and passwords as sensitive.
- Do not run commands that dump the full environment, such as plain `env`, `printenv`, or broad secret greps.

## External systems

- Do not push to `main` or `master` directly.
- Do not call production/mainnet endpoints from local experiments.
- Do not open PRs, create issues, or update remote systems unless requested.

## Local settings

Keep machine-specific AI/tool settings in `.ai/settings.local.json`, which is ignored by git.
