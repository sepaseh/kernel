#!/bin/bash
# Optional quality gate for AI tools that support task-completion hooks.
# Runs lint and typecheck when tracked or untracked TypeScript files changed.

PROJECT_DIR=${AI_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}

if [ -z "$PROJECT_DIR" ]; then
  exit 0
fi

cd "$PROJECT_DIR" || exit 0

MODIFIED=$(
  {
    git diff --name-only --diff-filter=ACMR HEAD 2>/dev/null
    git ls-files --others --exclude-standard 2>/dev/null
  } | grep -E '\.(ts|tsx)$' | sort -u || true
)

if [ -z "$MODIFIED" ]; then
  exit 0
fi

npm run lint || exit 2
npm run typecheck || exit 2

exit 0
