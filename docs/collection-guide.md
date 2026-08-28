# Executable API collection and local mock

Kernel's Bruno collection is the executable source of truth for the HTTP
boundary used by the frontend and local mock API.

## Ownership

Each operation directory contains:

- `index.bru` for the HTTP method, path, authentication, request example, and
  contract notes;
- status-named JSON files such as `200.json`, `401.json`, and `409.json` for
  saved response bodies.

The frontend feature `api.ts` and `types.ts` files consume this boundary. The
mock server reads it at startup through `server/collection.cjs`; it does not
maintain a second route registry or generated service catalog.

## Change sequence

When observable API behavior changes:

1. Update the Bruno request and saved response examples.
2. Update the owning feature API helper and types.
3. Update unit, contract, mock-server, and browser tests as applicable.
4. Update API or feature documentation when behavior or error handling changes.

Adding, moving, or removing a request automatically changes the routes loaded
the next time the mock process starts. Run `npm run server:test` to verify route
discovery and core local behavior.

## Runtime behavior

The mock server derives these values from the collection:

- method and path, including `{{parameter}}` path segments;
- whether bearer authentication is required;
- successful status and saved response body;
- saved error bodies available for simulation;
- system-administrator-only requirements documented by an operation.

Authentication tokens, account identity, user-list filtering, pagination, CORS,
and mock control endpoints are local runtime behavior implemented under
`server/`. Mutation responses are deterministic examples and are not persisted.

## Error simulation

Use a query parameter or request header to select an error status:

```text
GET /users?mock_status=403
X-Mock-Status: 409
```

The server checks route authentication and authorization before returning the
saved response. Otherwise it returns a generic message identifying the
simulated method, route, and status. Tests for protected UI error states must
provide a valid local token.

## Contract limitations

The mock validates route-level authentication and local credentials, but it is
not a backend conformance implementation. It does not prove:

- field-level request validation;
- authorization enforcement for every action permission;
- cookie rotation, revocation, CSRF defenses, or production cookie flags;
- database constraints, transactions, audit logging, or mutation persistence;
- rate limiting, capacity, latency, or availability behavior.

Use Pact and provider verification for consumer compatibility, and use an
authorized deployed environment for security and operational validation.
