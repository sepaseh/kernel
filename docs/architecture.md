# Architecture

## Application Entry

`src/main.tsx` mounts the React application. `src/app/App.tsx` composes the top-level providers and route tree.

The main runtime pieces are:

- `src/app/providers/core/Core.tsx` for language, theme, current route, and authenticated user state.
- `src/app/providers/antd/Antd.tsx` for Ant Design locale, direction, and theme tokens.
- `src/app/Routes.tsx` for browser routing.

## Provider Responsibilities

### Core Provider

`CoreProvider` stores global UI state in React state:

- `currentRoute`
- `language`
- `theme`
- `user`

It also synchronizes language and theme with local storage and configures Day.js to use the Jalali calendar when the active language is Persian.

### Ant Design Provider

`AntdProvider` configures Ant Design for the current language and theme. It is the place to change global component tokens or locale behavior.

## Routing

Route definitions are centralized in `src/app/config/routes.ts`. Each `routeTree`
entry owns its path, route access rule, and action permission mapping, making it
the single source of truth for routing and client-side authorization. The router
is created in `src/app/Routes.tsx` with `createBrowserRouter`.

The app uses two layouts:

- `AuthLayout` for `/auth`
- `DefaultLayout` for authenticated application pages

`SetCurrentRoute` wraps each route element and updates `CoreProvider` with the active route key. Navigation components should prefer `routeTree` rather than hard-coded paths.

`useAllowedRoutes` derives visible and accessible routes from each entry's
`permissions.access` value. Features use `useRoutePermissions(route)` to derive
named action booleans such as `canCreate` and `canUpdate` from the same entry.
`public` routes are always reachable, `authenticated` routes require a signed-in
user, and permission-gated routes require the declared permission unless the
user is a system administrator. These browser checks improve the user
experience only; APIs remain responsible for authorization.

## Feature Structure

The starter pages are:

- Login
- Account profile and credentials
- Empty dashboard
- Roles and permissions
- Users
- Not found

Route-level screens, forms, domain API helpers, and their tests stay together in
`src/features/<feature>`. Cross-feature UI belongs in `src/shared/ui`, generic
utilities in `src/shared/lib`, and HTTP/token infrastructure in `src/shared/api`.
Application composition belongs in `src/app`; layouts and static assets retain
their dedicated top-level directories.

## Dependency Direction

- `shared` is independent and cannot import from `app`, `features`, or `layouts`.
- Features may consume `shared` and application context hooks.
- A feature importing another feature must use that feature's root public API.
- `app` and `layouts` compose feature public APIs and shared infrastructure.

ESLint enforces the shared-layer and cross-feature rules. Feature root
`index.ts` files define public APIs; single-file internal barrels are avoided.
Dedicated lazy route entrypoints remain public subpaths so route chunks stay
independent.

## State and Persistence

The app keeps lightweight UI preferences in local storage through helpers in `src/shared/storage`.

Access tokens remain in frontend memory and are attached to protected API
requests as bearer tokens. The backend owns the refresh token in an HttpOnly
cookie. On application startup, a protected account request can trigger one
refresh request to restore an access token without exposing the refresh token
to JavaScript.

## Styling

Global styles live in `src/assets/styles`. The application bundles the Vazirmatn
variable WOFF2 from `src/assets/fonts/vazirmatn` and uses weights 100–900 with
`font-display: swap`. Vite fingerprints the local asset during production
builds; the application does not depend on an external font provider.

Prefer Ant Design components and theme tokens for new UI so layout, spacing, RTL behavior, and dark/light themes stay consistent.
