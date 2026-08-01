#!/bin/bash
# Optional post-edit helper for AI tools that provide JSON on stdin or in $INPUT.
# It runs ESLint auto-fix on edited TypeScript/JavaScript files when available.

if [ -z "${INPUT:-}" ]; then
  INPUT=$(cat)
fi

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .file_path // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx)
    npm run lint:fix -- "$FILE_PATH" >/dev/null 2>&1 || true
    ;;
esac

exit 0
