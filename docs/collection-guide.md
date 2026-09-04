# Executable API collection and backend

Kernel's Bruno collection is the executable source of truth for the public HTTP
boundary shared by the frontend and standalone backend.

## Ownership

Each operation directory contains:

- `index.bru` for the HTTP method, path, authentication, request example, and
  contract notes;
- status-named JSON files such as `200.json`, `401.json`, and `409.json` for
  saved response bodies.

Frontend feature `api.ts` and `types.ts` modules consume the boundary. Hono
routes under `server/src/routes` implement it. Saved examples are documentation
and executable client examples; the server does not return them as fixtures.

## Change sequence

When observable API behavior changes:

1. Update the Bruno request, operation notes, and saved responses.
2. Update the owning frontend API helper and types.
3. Update the Hono route and its database/application behavior.
4. Add or update focused backend, consumer-contract, and browser tests.
5. Update the mapped documentation when configuration or behavior changes.

Run `npm run server:test` for backend behavior, `npm run test:contract` for the
consumer boundary, and the smallest affected frontend tests.

## Runtime behavior

The backend preserves the collection's snake_case payloads and documented
status codes while adding persistent behavior:

- server-owned messages and permission titles use the global language stored
  in application settings, while user-entered content is never translated;
- Better Auth validates passwords and owns revocable database sessions;
- authorization checks system-administrator status and role permissions from
  SQLite on every protected operation;
- Drizzle transactions maintain role assignments and related records;
- application settings, users, roles, calendar dates, OTP challenges, and file
  metadata survive process restarts;
- the selected storage driver stores object bytes separately from SQLite;
  local development uses private/public directories and MinIO uses separate
  private/public buckets.

The old `mock_status` query, `X-Mock-Status` header, and `__mock` inspection
endpoints no longer exist. Tests that need an error must establish the relevant
state or send invalid input, so they exercise actual behavior.

## Contract scope

The collection describes observable HTTP compatibility. Database schema,
migrations, Better Auth internals, storage layout, operational limits, and runtime
composition are owned by `server/` and documented in the
[backend guide](../server/README.md). Pact protects selected consumer
interactions; backend integration tests protect persistence and authorization.
