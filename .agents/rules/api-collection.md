# API collection

- Treat `collection/` as the executable source of truth for observable HTTP
  behavior. Keep it aligned with feature API modules, types, mock-server
  behavior, tests, and the documents identified by `docs/README.md`.
- External JSON and query fields use `snake_case`; TypeScript may use
  `camelCase` after conversion at the transport boundary.
- Prefer omission for absent optional fields unless `null` has explicit domain
  meaning.
- Do not invent fields, envelopes, permissions, errors, or status codes without
  authoritative evidence.
- Keep tokens and examples synthetic. Never commit credentials, private
  endpoints, signed URLs, or personal data.
