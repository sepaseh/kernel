# Kernel

React starter kit upgraded as a dashboard-ready foundation under the `kernel` project name. It includes authentication, protected routing, an Ant Design layout, multilingual setup, API examples, and starter user/role management screens.

## Stack

| Layer | Library |
| --- | --- |
| UI framework | React 19 + TypeScript |
| Build tool | Vite |
| Component library | Ant Design 6 |
| Routing | `react-router-dom` 7 |
| Internationalization | `i18next` + `react-i18next` |
| HTTP | Axios |
| Date handling | Day.js + Jalaliday |
| Linting | ESLint + simple import sort |
| Cleanup checks | Knip |

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
npm run typecheck  # typecheck only
npm run knip       # detect unused files, exports, and dependencies
```

## Environment

| Variable | Description | Fallback |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Backend HTTP API base URL | `http://<current-host>` |
| `VITE_APP_BASE_URL` | Router basename / deployed base path | empty string |
| `VITE_AUTH_TOKEN_KEY` | Cookie key used for the bearer token | `kernel_auth_token` |

Example values are available in `.env.example`.

## Routes

| Path | Page | Access |
| --- | --- | --- |
| `/auth` | Login | public |
| `/` | Empty dashboard starter page | authenticated |
| `/password` | Change current user password | authenticated |
| `/roles` | Roles and permissions | `role_read` |
| `/users` | Users | `user_read` |
| `*` | Not found | public fallback |

## API Examples

The API layer intentionally uses generic starter endpoints so it can be wired to a real backend later.

| Area | Endpoint examples |
| --- | --- |
| Auth | `/api/v1/auth/login`, `/api/v1/auth/me`, `/api/v1/auth/password` |
| Users | `/api/v1/users`, `/api/v1/users/:id`, `/api/v1/users/:id/roles`, `/api/v1/users/:id/password`, `/api/v1/users/:id/status` |
| Roles | `/api/v1/roles`, `/api/v1/roles/:id`, `/api/v1/permissions` |

## Permissions

Starter permission keys live in `src/types/permission.ts` and cover basic CRUD-style access:

```ts
role_create | role_delete | role_read | role_update
user_create | user_delete | user_read | user_roles_update | user_status_update | user_update
```

Password pages/actions only require a valid auth token.

## Project Structure

```text
src/
  api/          Axios instance and auth/user/role endpoint examples
  components/   Shared UI components, including the starter Icon component
  config/       Routes, constants, language, and theme config
  contexts/     React contexts for providers
  forms/        User, user-role, and role form drawers
  hooks/        Shared React hooks and route permission helpers
  layouts/      Auth and authenticated app layouts
  locales/      English and Persian translation dictionaries
  pages/        Route-level pages
  providers/    Core and Ant Design providers
  storage/      Local storage helpers
  styles/       Global CSS and font styles
  types/        Shared TypeScript types
  utils/        Cookie, format, and transform helpers
```

## AI Guidance

Provider-neutral AI assistant guidance lives in `.ai/`. It documents project rules for code quality, imports, React, TypeScript, styling, testing, safety, and git workflow.

## Icons

Icons are centralized in `src/components/Icon.tsx`. Add new icon names to the internal `iconMap`, then render them with:

```tsx
<Icon name="user" />
<Icon name="delete" size={14} />
```
