# Development

This project is a Vite React application written in TypeScript.

## Prerequisites

- Node.js 24.15.0 or newer in the Node.js 24 LTS line; `.nvmrc` contains the
  exact version used by CI
- npm
- Access to the backend API, or the included local mock API

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
VITE_API_BASE_URL=http://127.0.0.1:3000
VITE_APP_BASE_URL=/
```

Start the app:

```bash
npm run dev
```

Vite is configured with `--host`, so the development server can be reached from the local network when your firewall allows it.

## Local Mock API

Kernel includes a dependency-free mock server that discovers HTTP contracts and
saved response examples directly from `collection/`. Start it in a second
terminal:

```bash
npm run server
```

Use `VITE_API_BASE_URL=http://127.0.0.1:3000` and sign in with identifier
`09123456789` and password `password123`. The server provides local JWT and
refresh-cookie behavior, authenticated account data, list filtering, CORS,
parameterized routes, and saved error simulation without contacting an external
service.

Run its focused tests with:

```bash
npm run server:test
```

See the [mock server guide](../server/README.md) for health, route-discovery, and
error-simulation endpoints. Credentialed CORS accepts only the exact
`MOCK_ALLOWED_ORIGIN`, which defaults to `http://127.0.0.1:5173`. The mock and
its local signing secret are for development only.

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
