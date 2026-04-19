#!/bin/bash
# Auto-format files with Prettier after Edit/Write

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css)
    npx prettier --write "$FILE_PATH" 2>/dev/null
    ;;
esac

exit 0
