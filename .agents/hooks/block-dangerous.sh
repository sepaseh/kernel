#!/bin/bash
# Optional safety hook for AI tools that pass JSON tool input on stdin.
# Blocks high-risk commands and sensitive file edits.

INPUT=$(cat)

if ! echo "$INPUT" | jq -e . >/dev/null 2>&1; then
  exit 0
fi

CMD=$(echo "$INPUT" | jq -r '.tool_input.command // .command // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .file_path // empty')
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // .content // empty')
COMBINED="$CMD $FILE_PATH $CONTENT"

if echo "$CMD" | grep -qE 'git (push.*(--force([^-]|$)|-f( |$)|-F( |$))|reset --hard|clean -[a-z]*f|branch.*(--delete|-D))'; then
  echo "Dangerous git command blocked. Ask the user first." >&2
  exit 2
fi

if echo "$CMD" | grep -qE 'git push.*(origin|upstream).*(main|master)([[:space:]]|$)'; then
  echo "Direct push to main/master blocked. Ask the user first." >&2
  exit 2
fi

if echo "$FILE_PATH" | grep -qiE '(^|/|\\)\.env(\.|$)|\.(pem|p12|key)$|credentials\.|secret\.|keystore'; then
  echo "Editing secret or credential files is blocked. Ask the user first." >&2
  exit 2
fi

if echo "$CMD" | grep -qiE '\b(printenv|export -p)\b|echo.*(TOKEN|API_KEY|SECRET|PASSWORD|CREDENTIAL)|(^|[;&|[:space:]])env([[:space:]]*$|[[:space:]]*\|)'; then
  echo "Environment variable exposure blocked." >&2
  exit 2
fi

if echo "$COMBINED" | grep -qiE 'mainnet|production|api\.etherscan\.io|mainnet\.infura\.io'; then
  echo "Production/mainnet endpoint detected. Ask the user first." >&2
  exit 2
fi

exit 0
