# Development

Kernel runs a Vite React frontend and a standalone Hono API as separate
processes. Start both for a self-contained local environment.

## Prerequisites

- Node.js 24.15.0 or newer in the Node.js 24 LTS line; `.nvmrc` contains the
  exact version used by CI
- npm

Docker and MinIO are optional. They are needed only when testing the MinIO
storage driver locally.

## Setup

Select the Node version in `.nvmrc` and install the locked dependencies:

```bash
nvm use
npm ci
```

Copy the example environment file:

```bash
cp .env.example .env.local
```

In Windows PowerShell, use `Copy-Item .env.example .env.local`. If your Node
version manager requires an explicit version (for example, nvm-windows), select
the version written in `.nvmrc` rather than relying on automatic file detection.
Keep an existing local configuration when revisiting this setup.

Set the frontend/API addresses in `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_BASE_URL=/
SERVER_ALLOWED_ORIGIN=http://localhost:5173
BETTER_AUTH_URL=http://localhost:3000
```

Set `BETTER_AUTH_SECRET` to a locally generated random value; the API has no
fallback secret. To generate a value locally, run:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Keep that value in your local environment file. For the optional sample account
and fixed local OTP adapter, also set:

```env
SERVER_SEED_DEVELOPMENT_DATA=true
OTP_FIXED_CODE=123456
```

The fixed code is a synthetic local fixture and is rejected in production.
The API applies migrations and creates default application settings on startup;
sample users, roles, and calendar dates require the seed flag.

Start the API:

```bash
npm run server
```

Then start the frontend in a second terminal:

```bash
npm run dev
```

Open `http://localhost:5173`. Vite binds to `localhost`, matching the default
CORS origin. `GET http://localhost:3000/health` should return
`{"status":"ok"}`. Changing backend configuration requires an API restart;
restart Vite after editing frontend environment values.

## Local API

The backend uses Better Auth, Drizzle/SQLite, and pluggable object storage.
With the optional seed enabled, sign in using `09123456789` / `password123`.
These are fixed development fixtures in `server/src/db/initialize.ts`, not
configurable seed-credential variables. Existing users are not reset by the
seed. User, role, calendar, settings, authentication, and
file-metadata mutations persist across restarts. The default local driver stores
uploaded bytes under `server/data/uploads`.

To exercise MinIO instead, set `STORAGE_DRIVER=minio` and start the included
service before the API:

```bash
docker compose up -d minio
npm run server
```

Run its focused tests with:

```bash
npm run server:test
```

See the [backend guide](../server/README.md) for migrations, storage, local OTP,
data ownership, and all environment variables. Credentialed CORS accepts only
the exact `SERVER_ALLOWED_ORIGIN`, which defaults to `http://localhost:5173`.

The included `compose.yaml` uses fixed local-only MinIO credentials. Changing
the API's `.env.local` does not change those service credentials; configure the
Compose service separately if you customize them, and keep both sides aligned.
Passing an environment file to Compose does not override literal values in
its service definition. Do not commit real credentials.

Use [Troubleshooting](troubleshooting.md) for startup and login failures, and
[Backup and restore](backup-restore.md) before repairing persistent data.

## Quality Checks

Before every commit, run the complete local CI suite. Do not create a commit
until every command succeeds:

```bash
npm run audit
npm run typecheck
npm run lint
npm run format:check
npm run test:coverage
npm run test:contract
npm run server:test
npm run knip
npm run performance
npm run build-storybook
npm run test:storybook
npm run test:e2e -- --project=chromium
```

The audit command makes up to three bounded attempts against the npm registry.
It requires a complete live report, fails when the advisory endpoint remains
unavailable, and blocks on high or critical vulnerabilities. Cached advisory
data is not accepted as a fresh CI audit.

Run type checking:

```bash
npm run typecheck
```

Run linting:

```bash
npm run lint
```

Build the app:

```bash
npm run build
```

Production builds require `VITE_API_BASE_URL` and `VITE_APP_BASE_URL` from
`.env.local` or the build environment. See [Deployment](deployment.md) for
their validation rules.

Check unused files, exports, and dependencies:

```bash
npm run knip
```

Explore shared UI and full-page layouts in isolation:

```bash
npm run storybook
```

Build the same static Storybook bundle validated by CI:

```bash
npm run build-storybook
```

Stories stay beside the component or layout they document. CI builds the
static Storybook bundle so broken stories and configuration fail before merge.

## Import Style

For a complete implementation checklist, see
[Adding a feature, page, and permission](feature-development.md).

Use `./` for same-directory imports and `@/` for imports that cross source directories:

```ts
import { fetchUsers } from "./api";
import { routeTree } from "@/app/config";
```

Keep feature code close to the existing structure:

- Feature API calls, screens, forms, and tests live together in `src/features`.
- Shared API infrastructure lives in `src/shared/api`.
- Shared UI lives in `src/shared/ui`.
- Shared utilities live in `src/shared/lib`.
- Domain contracts live beside their feature; infrastructure contracts live beside their shared module.

## Localization

The application ships with ten languages: `ar`, `de`, `en`, `es`, `fa`, `fr`,
`it`, `pt`, `ru`, and `tr`. Persian and Arabic use RTL; Persian displays the
Jalali calendar. Translation resources, provider mappings, the backend catalog,
and Gregorian API date rules are documented in [Localization](localization.md).
