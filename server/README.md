# Mock API server

The local mock API reads Kernel's Bruno collection directly, so request paths,
methods, authentication requirements, success statuses, and saved error examples
stay aligned with the executable contract.

## Run

From the repository root:

```bash
npm run server
```

The API listens on `http://127.0.0.1:3000` by default. Set `HOST` or `PORT` to
override the bind address or port. Configure the frontend with:

```text
VITE_API_BASE_URL=http://127.0.0.1:3000
```

Useful development endpoints:

- `GET /__mock/health` reports server status and the discovered route count.
- `GET /__mock/routes` lists the HTTP routes discovered in `collection/`.

Credentialed CORS defaults to `http://127.0.0.1:5173`. Set
`MOCK_ALLOWED_ORIGIN` to the exact frontend origin when using another local
host or port. Other origins do not receive credentialed CORS headers.

## Account

Use this system-administrator account for the complete starter flow:

| Identifier    | Password      |
| ------------- | ------------- |
| `09123456789` | `password123` |

The server issues a locally signed one-hour access token and a placeholder
HttpOnly refresh cookie. Mutation endpoints return their saved collection
responses but do not persist changes; lists and account data remain deterministic.

## Error simulation

Request a saved error response through either mechanism:

```text
GET /users?mock_status=403
X-Mock-Status: 409
```

Authentication and authorization are checked before simulation. When the
collection has no example for the requested 4xx or 5xx status, the server
returns a small generic simulated error.

## Test

```bash
npm run server:test
```

The server has no runtime dependencies and uses Node's built-in HTTP, crypto,
test, and fetch implementations.

## Architecture and limitations

The [collection integration guide](../docs/collection-guide.md) describes
source-of-truth ordering, contract update workflow, runtime ownership, and the
behaviors this mock intentionally does not emulate. The mock is excluded from
Kernel's production deployment and security boundaries.
