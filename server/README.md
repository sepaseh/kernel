# Kernel API server

`server/` is a standalone Node.js and TypeScript backend. Hono owns the HTTP
boundary, Better Auth owns passwords and sessions, Drizzle maps the application
schema to SQLite, and a local-filesystem or MinIO adapter stores uploaded
objects. The browser application is
only an API consumer; the backend does not import or depend on React or Vite.

The Bruno collection remains the executable source of truth for public methods,
paths, payloads, responses, and status codes. Runtime behavior is implemented in
`server/src` rather than generated from response examples.

Server-owned response text uses the global `settings.language_code`. Complete
backend resources are available for Arabic, German, English, Spanish, Persian,
French, Italian, Portuguese, Russian, and Turkish. User-entered names and titles
are stored and returned unchanged; language is not selected per request or per
user.

## Local setup

Follow [Development](../docs/development.md#setup) to copy the environment
example, set the required `BETTER_AUTH_SECRET`, and select optional seed/OTP
settings. Then start the API:

```bash
npm run server
```

Local development defaults to `STORAGE_DRIVER=local`, writes uploaded objects
under `server/data/uploads`, and does not require Docker. To run against MinIO,
change the driver and start the included service before the API:

```bash
docker compose up -d minio
npm run server
```

The API defaults to `http://localhost:3000`; `GET /health` is a liveness probe.
With the MinIO driver, its API and console default to ports `9000` and `9001`.
The server creates separate private and public buckets on startup and assigns
public-read policy only to the public bucket.

SQLite migrations run at startup and store local data in
`server/data/kernel.sqlite`. The file is ignored by Git. Migration files under
`server/drizzle` are versioned and can also be applied explicitly:

```bash
npm run server:migrate
```

The tables, columns, relationships, keys, and indexes are documented in the
[database schema](../docs/database-schema.md).

After changing `server/src/db/schema.ts`, create and review a migration:

```bash
npm run server:generate -- --name descriptive_name
```

## Local account and OTP

The optional idempotent development seed creates a missing system administrator
with mobile `09123456789` and password `password123`, using fixed synthetic
fixtures in `server/src/db/initialize.ts`. Enable it deliberately with
`SERVER_SEED_DEVELOPMENT_DATA=true`. Seed credentials are not environment
options, and rerunning the seed does not reset an existing user's credentials
or status. Never reuse these credentials in a deployed environment.

Local OTP flows require an explicit `OTP_FIXED_CODE`. This is a development
delivery adapter, not a production SMS or email provider. Production startup
rejects fixed OTP configuration; integrate a real delivery adapter before
exposing OTP authentication flows.

The included MinIO Compose service uses fixed local-only credential fixtures in
`compose.yaml`. It does not read the API's `.env.local` to override them. When
customizing MinIO, configure the service and API credentials consistently;
replace local fixtures before connecting to any non-local service.

## Configuration

Logging configuration (`LOG_LEVEL`, `SERVER_ENVIRONMENT`, and
`SERVER_RELEASE_ID`) is documented in [Backend logging](../docs/backend-logging.md).
Production startup requires an immutable `SERVER_RELEASE_ID`. JSON logs go to
stdout; development uses readable output with the same redaction rules. Each API
response carries `X-Request-Id`, including errors and binary file content.

| Variable                       | Default                          | Purpose                                   |
| ------------------------------ | -------------------------------- | ----------------------------------------- |
| `BETTER_AUTH_SECRET`           | required                         | Better Auth signing and encryption secret |
| `BETTER_AUTH_URL`              | `http://localhost:3000`          | Canonical backend URL                     |
| `DATABASE_URL`                 | `file:server/data/kernel.sqlite` | SQLite/libSQL connection URL              |
| `HOST` / `PORT`                | `localhost` / `3000`             | HTTP bind address                         |
| `SERVER_ALLOWED_ORIGIN`        | `http://localhost:5173`          | Exact credentialed CORS origin            |
| `SERVER_SEED_DEVELOPMENT_DATA` | `false`                          | Create local admin and sample records     |
| `STORAGE_DRIVER`               | `local` outside production       | Select `local` or `minio` storage         |
| `LOCAL_STORAGE_PATH`           | `server/data/uploads`            | Local object root                         |
| `MINIO_ENDPOINT`               | `localhost`                      | MinIO hostname without protocol           |
| `MINIO_PORT`                   | `9000`                           | MinIO API port                            |
| `MINIO_USE_SSL`                | `false`                          | Enable TLS for MinIO                      |
| `MINIO_ACCESS_KEY`             | local placeholder                | MinIO access key                          |
| `MINIO_SECRET_KEY`             | local placeholder                | MinIO secret key                          |
| `MINIO_BUCKET`                 | `kernel`                         | Prefix for public/private buckets         |
| `MINIO_PUBLIC_URL`             | `http://localhost:9000`          | Browser-visible object origin             |
| `UPLOAD_LIMIT_BYTES`           | `5242880`                        | Maximum multipart file size               |
| `OTP_FIXED_CODE`               | none                             | Explicit local-only OTP delivery value    |

Production defaults to the MinIO driver. MinIO configuration is required in
production only when that driver is selected. Local filesystem storage is
appropriate for development and persistent single-host deployments, but not
for ephemeral or horizontally scaled instances.

Production startup requires `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
`DATABASE_URL`, `SERVER_ALLOWED_ORIGIN`, and `SERVER_RELEASE_ID`. With MinIO it
also requires `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_ENDPOINT`, and
`MINIO_PUBLIC_URL`. `BETTER_AUTH_SECRET` is required in development as well.
Non-loopback MinIO connections require `MINIO_USE_SSL=true`.

Do not commit `.env.local`, credentials, or SQLite files. Production mode does
not create the development administrator or sample records. Replace every
development credential and provision the first production administrator through
an approved operational process before any shared deployment.

For request ordering and error paths, see [Runtime sequences](../docs/sequences.md).
For persistent data recovery, see [Backup and restore](../docs/backup-restore.md).
Changing a storage driver does not migrate existing objects or file metadata.

## Data ownership

Deleting, deactivating, or demoting a user must leave an active system
administrator. These operations read the target's current state, count active
administrators, and mutate within one SQLite write transaction. A target promoted
or activated by a concurrent request receives the same protection; a stale
pre-transaction read cannot bypass the guard. Conflicts return `409`.
See the [transaction sequence](../docs/sequences.md#final-administrator-protection)
for the concurrent-request example and the access rules for each operation.

OTP recovery and administrator password resets validate both length limits from
Better Auth's password configuration (currently 8–128 characters) before hashing
or changing credentials. Recovery validates length before consuming the OTP, so
an invalid password can be corrected with the same unexpired code.

- Better Auth tables store users, credential password hashes, sessions, and
  verification primitives. Better Auth's required `auth_email` is an internal
  identifier for mobile-first accounts; the nullable `email` column is the
  user's verified profile email and is omitted until the user adds one.
- Domain tables store roles, permissions, role assignments, calendar dates,
  settings, OTP challenges, and file metadata.
- The `files` table stores the storage bucket, object key, content type, size,
  original name, visibility, creator, and timestamp. Object bytes never enter
  SQLite.
- Settings refer to uploaded logos by file ID. Public URLs are derived from the
  stored metadata and current object-storage configuration.

## Tests

```bash
npm run server:test
```

The tests use a temporary SQLite database and isolated local/in-memory storage
adapters. They exercise migrations, seeded authentication, Better Auth bearer
sessions, persisted user/role behavior, OTP registration, CORS, uploads, public
file reads, path traversal protection, and file metadata without contacting
MinIO or any production service.

`server/src/auth-invariants.test.ts` uses a fresh in-memory SQLite database per
test, applies the same migrations, and exercises real Better Auth sessions. It
controls request interleavings at the transaction boundary to verify final-admin
protection after promotion and activation, and covers password-policy rejection,
unchanged credentials, OTP reuse after validation failure, and replay rejection.
It also verifies that frontend-generated temporary passwords work for user
creation and administrator resets, including subsequent login.
