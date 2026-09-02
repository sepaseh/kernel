# API collection

- Treat `collection/` as the executable source of truth for observable HTTP
  behavior. Keep it aligned with feature API modules, types, mock-server
  behavior, tests, and the documents identified by `docs/README.md`.
- Update every affected contract surface in the same change. A request field,
  response field, default value, validation rule, status code, or endpoint
  behavior change is incomplete until the collection example and operation
  docs, frontend types and API module, mock behavior, affected tests, and the
  mapped repository documentation agree.
- Review both request and response examples when changing creation defaults.
  Defaults owned by the backend must not be sent by frontend forms, and must be
  present in successful responses whenever the resulting domain model requires
  them.
- External JSON and query fields use `snake_case`; TypeScript may use
  `camelCase` after conversion at the transport boundary.
- Define a local `basePath` in each feature `api.ts` and build that feature's
  endpoint paths from it instead of repeating the same route prefix. Give
  unrelated top-level endpoints their own descriptive path constant.
- Prefer omission for absent optional fields unless `null` has explicit domain
  meaning.
- Do not invent fields, envelopes, permissions, errors, or status codes without
  authoritative evidence.
- Keep tokens and examples synthetic. Never commit credentials, private
  endpoints, signed URLs, or personal data.
