# Kernel

Kernel is a React administration frontend and reusable dashboard foundation. It
includes authentication and account flows, permission-aware routing, user and
role management, a system calendar, runtime branding and theme settings, a
standalone persistent API, and production-oriented quality gates.

## Stack

| Layer                    | Library or tool               |
| ------------------------ | ----------------------------- |
| UI framework             | React 19 + TypeScript         |
| Build tool               | Vite                          |
| Component library        | Ant Design 6 + `antd-style`   |
| Routing                  | `react-router` 8.3            |
| Internationalization     | `i18next` + `react-i18next`   |
| HTTP                     | Axios                         |
| Date handling            | Day.js + Jalaliday            |
| API collection           | Bruno                         |
| Backend API              | Hono + Better Auth            |
| Persistence              | Drizzle ORM + SQLite          |
| Object storage           | Local filesystem or MinIO     |
| Unit and component tests | Vitest + Testing Library      |
| API mocking              | MSW                           |
| Contract tests           | Pact                          |
| Browser and a11y tests   | Playwright + axe-core         |
| UI development           | Storybook                     |
| Mutation tests           | Stryker                       |
| Performance checks       | Lighthouse + bundle-size gate |
| Static quality           | ESLint + Prettier + Knip      |
| Code analysis            | SonarQube + CodeQL            |

## Getting Started

Use Node.js 24.15.0 or newer within the Node.js 24 line. CI uses the exact
version recorded in `.nvmrc`; select it before installing dependencies:

```bash
nvm use
npm ci
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Start the development server:

```bash
npm run dev
```

The frontend starts on `http://localhost:5173`. For a self-contained local
environment, start `npm run server` in a second terminal before starting Vite.
Windows users can copy `.env.example` to `.env.local` with their preferred shell
or file manager.

## Scripts

| Command                   | Purpose                                               |
| ------------------------- | ----------------------------------------------------- |
| `npm run dev`             | Start Vite on `localhost`                             |
| `npm run build`           | Validate production environment, typecheck, and build |
| `npm run preview`         | Preview the production build                          |
| `npm run server`          | Start the standalone local API                        |
| `npm run server:generate` | Generate a reviewed Drizzle migration                 |
| `npm run server:migrate`  | Apply pending SQLite migrations                       |
| `npm run audit`           | Check for high-severity dependency vulnerabilities    |
| `npm run typecheck`       | Run TypeScript without emitting files                 |
| `npm run lint`            | Run ESLint                                            |
| `npm run lint:fix`        | Apply safe ESLint fixes                               |
| `npm run format`          | Format tracked source and documentation               |
| `npm run format:check`    | Verify Prettier formatting                            |
| `npm run knip`            | Detect unused files, exports, and dependencies        |
| `npm run test`            | Run unit and component tests                          |
| `npm run test:watch`      | Run Vitest in watch mode                              |
| `npm run test:coverage`   | Run tests and produce coverage for CI and Sonar       |
| `npm run test:contract`   | Generate and verify Pact consumer contracts           |
| `npm run server:test`     | Test backend persistence and API behavior             |
| `npm run test:e2e`        | Run Playwright browser journeys                       |
| `npm run storybook`       | Start the component explorer                          |
| `npm run test:storybook`  | Run Storybook interaction and accessibility tests     |
| `npm run build-storybook` | Build the static Storybook                            |
| `npm run performance`     | Build and enforce bundle-size budgets                 |
| `npm run lighthouse`      | Run the advisory local Lighthouse audit               |

Specialized mutation, smoke, staging, interactive browser, and visual-baseline
commands are documented in [Testing](docs/testing.md). Run the complete required
gate from [CONTRIBUTING.md](CONTRIBUTING.md) before committing or pushing.

## Environment

| Variable                       | Scope    | Requirement or default                                              |
| ------------------------------ | -------- | ------------------------------------------------------------------- |
| `VITE_API_BASE_URL`            | Frontend | Required absolute URL in production; current origin otherwise       |
| `VITE_APP_BASE_URL`            | Frontend | Required in production; must start and end with `/`                 |
| `VITE_OBSERVABILITY_URL`       | Frontend | Optional absolute event-collector URL; disabled when omitted        |
| `VITE_RELEASE_ID`              | Frontend | Optional immutable release identifier; defaults to `unknown`        |
| `HOST` / `PORT`                | Backend  | Bind address; defaults to `localhost:3000`                          |
| `SERVER_ALLOWED_ORIGIN`        | Backend  | Exact credentialed CORS origin; defaults to `http://localhost:5173` |
| `SERVER_SEED_DEVELOPMENT_DATA` | Backend  | Enables synthetic local seed data; disabled in production           |
| `BETTER_AUTH_SECRET`           | Backend  | Better Auth secret; replace the local fallback outside development  |
| `BETTER_AUTH_URL`              | Backend  | Canonical backend URL; defaults to `http://localhost:3000`          |
| `DATABASE_URL`                 | Backend  | SQLite URL; defaults to `file:server/data/kernel.sqlite`            |
| `STORAGE_DRIVER`               | Backend  | `local` by default outside production; `minio` in production        |
| `LOCAL_STORAGE_PATH`           | Backend  | Local upload directory; defaults to `server/data/uploads`           |
| `MINIO_*`                      | Backend  | Required when `STORAGE_DRIVER=minio`                                |
| `UPLOAD_LIMIT_BYTES`           | Backend  | Maximum uploaded file size; defaults to 5 MiB                       |
| `OTP_FIXED_CODE`               | Backend  | Local-only OTP value; defaults to `123456`                          |

Frontend variables are embedded by Vite at build time. Production builds stop
before compilation when either required variable is missing or malformed;
`VITE_OBSERVABILITY_URL`, when supplied, must also be an absolute URL. Example
local values are available in `.env.example`. Keep machine-specific values in
`.env.local` and do not commit secrets.

## Local API

For local development, start `npm run server` and set
`VITE_API_BASE_URL=http://localhost:3000`. The backend binds to
`localhost:3000`, applies SQLite migrations, stores uploads under
`server/data/uploads`, and allows credentialed CORS from
`http://localhost:5173` by default. Docker is not required for this default.

Use `09123456789` / `password123` for the seeded system-administrator flow and
`123456` for local OTP flows. `GET /health` reports API health. All domain
mutations persist in SQLite, while uploaded bytes are stored by the selected
storage driver and only their metadata/references are stored in the database. See the
[backend guide](server/README.md) for configuration and data ownership.

## Included Features

- Authentication provides login, registration, forgotten-password, refresh,
  logout, and authenticated password-change operations.
- Account management keeps profile, username, verified email, and password
  forms in one vertical flow.
- User management provides server-side filtering and pagination, create/edit,
  activation, role assignment, password reset, system-administrator toggling,
  and deletion. Boolean status columns use semantic check/close icons.
- Role management provides create/edit/delete flows and loads assignable
  permission groups from `/roles/permissions`.
- Calendar management displays Gregorian API dates in the active Day.js
  calendar and lets authorized users add or remove dates by selecting a cell.
- System settings manage language, separate light/dark logos, and complete Ant
  Design palettes, applying successful updates to the current session.
- The responsive authenticated layout uses permission-filtered navigation,
  breadcrumbs, and a centered maximum-width header and content container.
- The user menu provides account navigation, light/dark theme switching,
  compact/normal density switching, and logout. Theme, density, and language
  preferences are synchronized through local storage.
- Persian uses the Jalali Day.js calendar and RTL direction. Arabic is also RTL;
  the remaining supported languages are LTR. The bundled `public/logo.svg` is
  the fallback logo for both themes, and `#61dafb` is the default primary color.

## Routes

| Path                    | Page                                   | Access            |
| ----------------------- | -------------------------------------- | ----------------- |
| `/auth`                 | Login                                  | public            |
| `/auth/forgot-password` | Forgot password                        | public            |
| `/auth/register`        | Registration                           | public            |
| `/`                     | Empty dashboard starter page           | authenticated     |
| `/account`              | Profile, username, email, and password | authenticated     |
| `/calendar`             | Calendar                               | `calendar.read`   |
| `/roles`                | Roles and permissions                  | `roles.read`      |
| `/settings`             | System settings                        | `settings.update` |
| `/users`                | Users                                  | `users.read`      |
| `*`                     | Not found                              | public fallback   |

## API Surface

The Bruno collection is the executable source of truth for observable HTTP
behavior. Feature-local API modules expose the same contracts to the frontend,
while `src/shared/api` owns transport, token refresh, case conversion, and file
upload infrastructure.

| Area     | Endpoint examples                                                                                                                             |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth     | `/auth/register`, `/auth/login`, `/auth/otp-request`, `/auth/forgot-password`, `/auth/refresh-token`, `/auth/change-password`, `/auth/logout` |
| Account  | `/account/me`, `/account/update-profile`, `/account/update-username`, `/account/request-email-verification`, `/account/verify-email`          |
| Calendar | `/calendar`, `/calendar/:date`                                                                                                                |
| Users    | `/users`, `/users/:id`, `/users/:id/roles`, `/users/:id/password`, `/users/:id/status`, `/users/:id/system-admin`                             |
| Roles    | `/roles`, `/roles/:id`, `/roles/permissions`                                                                                                  |
| Settings | `/settings`, `/languages`, `/files`                                                                                                           |

Protected API requests automatically make one refresh attempt after a `401`.
Concurrent failures share the same `/auth/refresh-token` request, whose
backend-managed HttpOnly refresh cookie is sent with browser credentials.

Access tokens are kept in frontend memory only and are never written to cookies
or local storage. If refresh fails, authentication state is cleared and the
user returns to the login page.

Request bodies are converted from camelCase to snake_case, responses from
snake_case to camelCase, and `null` response properties are omitted so nullable
backend values become optional frontend properties. See the
[API client guide](docs/api-client.md) and [collection guide](docs/collection-guide.md)
for the detailed contract and ownership rules.

## Permissions

Permission contracts live in `src/features/roles/types.ts`; route and action
permission mappings live in `src/app/config/routes.ts`. Every route declares
its public, authenticated, or permission-gated `permissions.access` rule.
Permission-gated routes use `.read` permissions for access and can expose
create, delete, and update actions through `getRoutePermissions(route, user)`:

```ts
type RouteAccessPermission =
  "calendar.read" | "roles.read" | "settings.update" | "users.read";

type RouteActionPermission =
  | "calendar.update"
  | "roles.create"
  | "roles.delete"
  | "roles.update"
  | "users.create"
  | "users.delete"
  | "users.update";
```

`SYSTEM_ADMIN` bypasses role permission checks. Changing the authenticated
account's own password requires a valid token; resetting another user's
password and changing `is_system_admin` are separate system-administrator
contracts and are not assignable role permissions.

## Project Structure

```text
.agents/       Provider-neutral assistant rules, skills, and safety hooks
.github/       CI, security, staging, deployment-smoke, and release workflows
collection/   Executable Bruno HTTP contracts and saved responses
docs/         Architecture, development, testing, security, and operations guides
e2e/          Playwright browser, accessibility, localization, and visual tests
public/       Public application assets, including the fallback logo and favicon
scripts/      Environment, bundle, Lighthouse, and workflow validation scripts
server/       Standalone Hono API, migrations, persistence, auth, and storage
src/
  app/        Application composition, routes, providers, access policy, and app hooks
  assets/     Local fonts and global styles
  features/   Route screens and domain modules
  layouts/    Public and authenticated application shells
  shared/     Reusable API, config, hooks, i18n, storage, UI, and utilities
  test/       Shared test infrastructure and cross-feature integration suites
tooling/      Shared paths and repository tooling helpers
```

Feature code owns its API, types, components, tests, stories, and page-level
composition. Cross-feature imports use each feature's public `index.ts`; reusable
infrastructure belongs in `shared`, which cannot depend on app, feature, or
layout layers. The `@/` alias resolves to `src/`.

## AI Guidance

AI assistants should start with `AGENTS.md`; provider-neutral detailed guidance
lives in `.agents/`. The complete subsystem-to-document index is available in
[the documentation map](docs/README.md).

## Icons

Feature and layout code imports and renders the specific local icon component it
needs instead of routing icons through a name-based wrapper, importing an icon
package, or rendering emoji. Each icon lives under `src/shared/ui/icon` and is
built on `SvgIcon`, so it inherits `currentColor` and remains decorative to
assistive technology.

To add an icon:

1. Copy only the required Material UI SVG path from `@mui/icons-material` into a
   new local `NameIcon.tsx` component; MUI is not a runtime dependency.
2. Render the path through `SvgIcon` and type the component with
   `FC<SVGProps<SVGSVGElement>>`.
3. Export the component from `src/shared/ui/icon/index.ts`.
4. Add or update Storybook coverage when the icon has a meaningful visual state.

Call sites render the component directly and may override the inherited size:

```tsx
import { DeleteIcon, PersonIcon } from "@/shared/ui/icon";

<PersonIcon />
<DeleteIcon style={{ fontSize: 14 }} />
```

Icons are decorative by default; the owning button, link, or control must supply
its accessible name.
