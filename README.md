# Kernel

React starter kit upgraded as a dashboard-ready foundation under the `kernel` project name. It includes authentication, protected routing, an Ant Design layout, multilingual setup, API examples, and starter user/role management screens.

## Stack

| Layer                | Library                     |
| -------------------- | --------------------------- |
| UI framework         | React 19 + TypeScript       |
| Build tool           | Vite                        |
| Component library    | Ant Design 6                |
| Routing              | `react-router` 8.3          |
| Internationalization | `i18next` + `react-i18next` |
| HTTP                 | Axios                       |
| Date handling        | Day.js + Jalaliday          |
| Linting              | ESLint + simple import sort |
| Cleanup checks       | Knip                        |

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Start the development server:

```bash
npm run dev
```

## Scripts

```bash
npm run dev        # start Vite dev server
npm run build      # typecheck and build for production
npm run preview    # preview production build
npm run lint       # run ESLint
npm run lint:fix   # run ESLint with auto-fix
npm run audit      # check dependencies for high-severity vulnerabilities
npm run typecheck  # typecheck only
npm run knip       # detect unused files, exports, and dependencies
```

## Environment

| Variable            | Description                          | Fallback                |
| ------------------- | ------------------------------------ | ----------------------- |
| `VITE_API_BASE_URL` | Backend HTTP API base URL            | `http://<current-host>` |
| `VITE_APP_BASE_URL` | Router basename / deployed base path | empty string            |

Example values are available in `.env.example`.

## Routes

| Path                    | Page                                   | Access          |
| ----------------------- | -------------------------------------- | --------------- |
| `/auth`                 | Login                                  | public          |
| `/auth/forgot-password` | Forgot password                        | public          |
| `/auth/register`        | Registration                           | public          |
| `/`                     | Empty dashboard starter page           | authenticated   |
| `/account`              | Profile, username, email, and password | authenticated   |
| `/roles`                | Roles and permissions                  | `role_read`     |
| `/users`                | Users                                  | `users.read`    |
| `*`                     | Not found                              | public fallback |

## API Examples

The API layer includes reusable authentication and account endpoints alongside generic administration examples.

| Area    | Endpoint examples                                                                                                                             |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth    | `/auth/register`, `/auth/login`, `/auth/otp-request`, `/auth/forgot-password`, `/auth/refresh-token`, `/auth/change-password`, `/auth/logout` |
| Account | `/account/me`, `/account/update-profile`, `/account/update-username`, `/account/request-email-verification`, `/account/verify-email`          |
| Users   | `/users`, `/users/:id`, `/users/:id/roles`, `/users/:id/workspaces`, `/users/:id/password`, `/users/:id/status`, `/users/:id/system-admin`    |
| Roles   | `/roles`, `/roles/:id`, `/permissions`                                                                                                        |

Protected API requests automatically make one refresh attempt after a `401`.
Concurrent failures share the same `/auth/refresh-token` request, whose
backend-managed HttpOnly refresh cookie is sent with browser credentials.

Run the test suite once with `npm test`, or use `npm run test:watch` during
development. See [Testing](docs/testing.md) for the complete unit, component,
API-mocking, coverage, and browser testing strategy.
Access tokens are kept in frontend memory only and are never written to cookies
or local storage. If refresh fails, authentication state is cleared and the
user returns to the login page.

## Permissions

Permission contracts live in `src/features/roles/types.ts`; route and action
permission mappings live in `src/app/hooks` and cover basic CRUD-style access:

```ts
role_create | role_delete | role_read | role_update;
user_create |
  user_delete |
  user_read |
  user_roles_update |
  user_status_update |
  user_update;
```

Password pages/actions only require a valid auth token.

## Project Structure

```text
src/
  app/          Application composition, routes, providers, contexts, and app hooks
  assets/       Fonts and global styles
  features/     Account, authentication, role, user, and dashboard slices
  layouts/      Auth and authenticated application shells
  shared/       Reusable API infrastructure, config, hooks, i18n, storage, UI, and utilities
  test/         Shared test infrastructure and cross-feature integration tests
```

## AI Guidance

Provider-neutral AI assistant guidance lives in `.agents/`. It documents project rules for code quality, imports, React, TypeScript, styling, testing, safety, and git workflow.

## Icons

Icons are centralized in `src/shared/ui/icon/Icon.tsx`. Add new icon names to the internal `iconMap`, then render them with:

```tsx
<Icon name="user" />
<Icon name="delete" size={14} />
```
