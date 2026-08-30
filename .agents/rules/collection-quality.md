# Collection quality

## Validate changes

- Parse every changed JSON file; for contract-wide changes, parse all JSON files.
- Search for obsolete field names after renames.
- Check Bruno template variables against the documented environment values.
- Review request scripts after response-field changes.
- Confirm collection examples, mock-server behavior, tests, and documentation
  describe the same behavior.

## Scope and readability

- Solve the requested contract change directly; do not add speculative endpoints
  or examples.
- Keep payloads realistic but non-sensitive.
- Keep JSON response examples and `body:json` blocks valid. Sort object keys
  alphabetically when order has no contract meaning; preserve array order.
