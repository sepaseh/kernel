# Development

This project is a Vite React application written in TypeScript.

## Prerequisites

- Node.js 24.15.0 or newer in the Node.js 24 LTS line; `.nvmrc` contains the
  exact version used by CI
- npm

Docker and MinIO are optional. They are needed only when testing the MinIO
storage driver locally.

## Setup

Install dependencies:

```bash
npm install
```

Copy the example environment file:

```bash
cp .env.example .env.local
```

Update `.env.local` for your backend:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_BASE_URL=/
```

Start the app:

```bash
npm run dev
```

Vite is configured to bind to `localhost`, matching the backend's default CORS
origin.

## Local API

Kernel includes a standalone Hono backend with Better Auth, Drizzle/SQLite, and
pluggable object storage. Start the API in a second terminal:

```bash
npm run server
```

Set `SERVER_SEED_DEVELOPMENT_DATA=true` with local-only administrator
credentials, use `VITE_API_BASE_URL=http://localhost:3000`, and sign in with the
seeded account. SQLite migrations and the optional idempotent development seed
run at startup. User, role, calendar, settings, authentication, and
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

The audit command uses the npm registry first. If the advisory endpoint is
temporarily unavailable, it reruns against npm's local advisory cache; a
completed report containing high or critical vulnerabilities remains blocking.

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

The application currently ships with English (`en`) and Persian (`fa`). Translation strings live in `src/shared/i18n/locales/en.ts` and `src/shared/i18n/locales/fa.ts`.

Ant Design direction and locale are selected in `src/app/providers/antd/Antd.tsx`. Day.js locale/calendar setup is handled in `src/app/providers/core/Core.tsx`, using the Jalali calendar for Persian.
