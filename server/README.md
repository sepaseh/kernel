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

Copy `.env.example` to `.env.local`, then start the API:

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

The optional idempotent development seed creates a system administrator from
local-only seed values. Enable it deliberately with
`SERVER_SEED_DEVELOPMENT_DATA=true`; never reuse its credentials in a deployed
environment.

Local OTP flows require an explicit `OTP_FIXED_CODE`. This is a development
delivery adapter, not a production SMS or email provider. Production startup
rejects fixed OTP configuration; integrate a real delivery adapter before
exposing OTP authentication flows.

The included MinIO Compose service also uses local-only credentials from the
developer environment. Replace them before connecting to any non-local service.

## Configuration

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

Do not commit `.env.local`, credentials, or SQLite files. Production mode does
not create the development administrator or sample records. Replace every
development credential and provision the first production administrator through
an approved operational process before any shared deployment.

## Data ownership

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
