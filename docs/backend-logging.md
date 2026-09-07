# Backend logging

The standalone API uses Pino and writes one JSON object per stdout line. There
is no log table, database writer, file transport, or network logging client.
Development uses `pino-pretty` after the same sanitization pipeline. Server
logging never imports browser observability or Vite configuration.

## Configuration

| Variable             | Default                                  | Meaning                                                |
| -------------------- | ---------------------------------------- | ------------------------------------------------------ |
| `NODE_ENV`           | `development`                            | Runtime mode; use `production` for deployed servers    |
| `LOG_LEVEL`          | `debug` in development; otherwise `info` | `debug`, `info`, `warn`, or `error`                    |
| `SERVER_ENVIRONMENT` | `NODE_ENV`                               | Deployment name, for example `staging` or `production` |
| `SERVER_RELEASE_ID`  | `development` outside production         | Immutable release identifier; required in production   |

Set the backend release and frontend `VITE_RELEASE_ID` from the same immutable
deployment identifier when deploying them together. Environment names allow
1–64 ASCII letters, digits, underscores, periods, or hyphens. Releases allow
1–128 of those characters plus `@` and `/`. Invalid configuration fails startup
without printing the supplied value. If logging configuration itself fails, a
JSON bootstrap logger uses `environment=bootstrap` and `release=unknown`.

Pretty output is enabled only when both the runtime and the environment are
`development`. Production never loads the development-only `pino-pretty`
dependency. Tests inject an in-memory destination and parse actual JSON output.
Pino uses numeric levels: debug 20, info 30, warn 40, error 50. Fatal process and
startup failures use its standard fatal level 60.

## Request lifecycle and identity

`index.ts` constructs the logger before database, auth, and storage initialization
and supplies it through `Dependencies`. The Hono middleware order is request ID,
request logging, CORS, settings/translation, then routes and authentication.
Each request gets a child logger on its own context. Better Auth's diagnostic
callback uses a bounded request scope through Node's `AsyncLocalStorage`; it
falls back to the injected root logger outside a request. It never prints raw
library messages or arguments. Request diagnostics omit duplicate exception
details; the final request record owns the exception stack.

`X-Request-Id` accepts 1–128 ASCII letters, digits, underscores, hyphens, or equals
signs. Missing, empty, or invalid values are replaced with a UUID. Values that
match sensitive-text redaction, such as a mobile number or `token=...`, also get
a new UUID rather than a different redacted value in the log. The canonical
value is returned even on errors, OPTIONS, and binary file responses. CORS allows
the request header and exposes the response header. An incoming ID is untrusted
correlation metadata, not an authenticated identity or unique audit identifier.
A deployed trusted proxy can overwrite client IDs at the ingress boundary.

`authenticate` binds `userId` only after session and active-account checks, before
checking permissions. Thus a permission-denied response can identify an already
authenticated actor. Login and registration bind identity after Better Auth
succeeds; refresh binds the identity from its validated session. A user found by
an unauthenticated identifier lookup is never bound. Root logger bindings are
not mutated, and overlapping requests cannot share user identity.

The browser API client preserves a valid response ID on the resulting Error.
When that Error is passed to browser `reportError`, its context includes the ID.
Handled errors are not automatically sent to an external service. No JSON
response envelope or frontend domain payload changes are required.

## Schema and events

Every record includes `time` (UTC ISO timestamp), `level`, `service=kernel-api`,
`environment`, and `release`. Request records also carry `requestId`. Exactly one
`api.request.completed` record is emitted per request handled by Hono, with
`method`, `path`, `status`, and `durationMs`. Here `path` is the matched route
template, such as `/users/:userId`, not an arbitrary raw URL. Unmatched paths and
preflights without a method-specific route use `[unmatched]`. Query strings and
path parameter values are never recorded.

Duration measures application handling, including settings lookup and auth,
through production of the Response. It does not measure delivery of all bytes
to the client or completion of a future streaming response. Requests rejected
before Hono or served directly by a proxy/MinIO need infrastructure logging.

| Event                      | Level                                      | Additional fields                                         |
| -------------------------- | ------------------------------------------ | --------------------------------------------------------- |
| `api.request.completed`    | info for <400; warn for 4xx; error for 5xx | method, path, status, durationMs, optional reason and err |
| `auth.login.failed`        | warn for 4xx; error for 5xx                | method, path, status, optional reason                     |
| `auth.diagnostic`          | Better Auth's diagnostic level             | component; safe err outside requests                      |
| `file.upload.completed`    | info                                       | fileId, sizeBytes, contentType, visibility                |
| `file.upload.failed`       | warn for 4xx; error for 5xx                | stage, method, path, status, optional reason              |
| `storage.operation.failed` | error                                      | storageDriver, operation; optional fileId                 |
| `storage.cleanup.failed`   | error                                      | fileId, safe err for the separate cleanup failure         |
| `server.started`           | info                                       | port                                                      |
| `server.stopped`           | info                                       | no request context                                        |
| `server.startup.failed`    | fatal                                      | safe err                                                  |
| `server.shutdown.failed`   | error                                      | safe err or timeout reason                                |
| `server.crashed`           | fatal                                      | source, safe err                                          |

Storage operation records describe the failing operation without repeating its
stack. The final request/startup error owns that stack. A failed compensating
delete has its own `storage.cleanup.failed` record because it is a different
exception from the metadata write failure. Uploads succeed only after the object
and metadata have been stored. The original metadata error remains the API error
when compensating deletion also fails.

`app.onError` only builds a response. Hono's final `context.error` drives logging,
including errors Hono catches internally. Non-Error throws are normalized at the
outer middleware. Expected `ApiError` 4xx responses do not include stacks in logs.
Unexpected provider failures propagate as generic 500 responses instead of
being flattened to invalid credentials or validation failures. Server 500 errors
include safe stack locations in logs, never exception details in API responses.

SIGINT/SIGTERM stops accepting requests, closes the database, and flushes logs.
Graceful shutdown is bounded to ten seconds. Uncaught exceptions and unhandled
rejections emit a fatal record, allow at most one second to flush, and exit 1.
They do not resume serving requests. Hard kills and broken stdout cannot guarantee
delivery; a process supervisor is responsible for restarts.

## Sensitive data policy

Application call sites select metadata explicitly. Never pass raw requests,
responses, bodies, headers, configuration, auth/session objects, file contents,
SQL, or SDK clients to the logger. Recursive sanitization additionally redacts
credential-like field names regardless of case and separators, including
authorization, cookies, passwords/hashes, OTP, token, secret, database URLs,
MinIO settings, bucket/object names, identifiers, email, and mobile fields.
Pino path redaction provides a second safeguard for common fields.

Free-text sanitation removes authorization values, URLs, email/mobile values,
credential assignments and query data, and bounds output length. It cannot
recognize a bare unknown secret in arbitrary prose; application messages must
remain fixed strings and must not interpolate user data. Additional formatting
arguments are intentionally ignored. Never disable this policy in development.

Errors are a stricter boundary: raw messages are withheld because Drizzle messages
can contain query parameters and SDK messages can contain credentials. The
serializer retains an allowed error type/code, bounded cause and aggregate-error
chains, and V8 source basenames with line/column numbers. It discards raw message
lines, absolute directories, query/params, and arbitrary Error properties. Pino
is always given an explicit message so it cannot copy a raw `err.message` into
`msg`. Unknown throws, cycles, unsupported objects and getters are handled without
copying their payloads. Use the event, operation, safe reason, release, and source
locations to diagnose failures.

Do not treat these operational logs as an immutable security audit trail. Even
opaque user IDs are access-controlled data. Set retention, encryption, and reader
permissions at the collection/storage layer.

## Future collection and error tracking

Deploy a collector outside the request path to forward stdout to Loki, Better
Stack, or another JSON-capable backend. Give it bounded buffers, retries, disk
rotation, retention, and a budget. Select these settings for the actual deployment;
this repository does not install a collector or contact a logging service.

In Loki use low-cardinality labels such as service and environment. Keep userId,
requestId, fileId and other unbounded fields in structured metadata or the JSON
body, not labels. Direct public MinIO downloads do not pass through Hono and
require storage/proxy access logging if needed.

Sentry remains optional. Add it when release regression grouping and incident
triage are needed, capture unexpected exceptions once, and use the same release,
environment and request ID. Its SDK needs an independent data-collection and
before-send sanitization policy: Pino redaction does not sanitize Sentry events.
Do not enable tracing, request bodies, replay, or log forwarding by default.

## Verification

Run `npm run server:test` for JSON redaction, Error/cause serialization, process
termination, pretty output, request IDs/CORS, early failures, auth identity,
concurrent requests, uploads, binary responses and storage/cleanup failures.
Tests use synthetic data, SQLite in memory, and an injected memory storage
adapter. `npm run test:contract` and the API client/observability unit tests cover
the error response and browser correlation boundary.
