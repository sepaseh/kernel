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

`AntdProvider` configures Ant Design for the current language and theme and
mounts Ant Design's application boundary. Components obtain message, modal,
notification, and token APIs through `useAntd`, which delegates to
`AntdApp.useApp` rather than a project-owned context.

## Routing

Route definitions are centralized in `src/app/config/routes.ts`. Each `routeTree`
entry owns its path, route access rule, and action permission mapping, making it
the single source of truth for routing and client-side authorization. The router
is created in `src/app/Routes.tsx` with `createBrowserRouter` by grouping
`routeTree` entries according to their declared layout. The same configuration
exports `navigationTree`, which controls the menu hierarchy without duplicating
paths or labels in a layout component.

The app uses two layouts:

- `AuthLayout` for `/auth`
- `DefaultLayout` for authenticated application pages

`RouteWrapper` wraps each route element and updates `CoreProvider` with the active route key. Navigation components should prefer `routeTree` rather than hard-coded paths. The root router error boundary reports route and layout failures through observability and renders the shared application fallback.

Pure policy functions in `src/app/lib/access.ts` evaluate route access, derive
named action booleans such as `canCreate` and `canUpdate`, and filter
`navigationTree` recursively. Router, layout, and feature components pass the
current account to these functions directly; access policy does not depend on
React hooks. Empty navigation groups are omitted and nested groups are
supported.
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

Feature-owned UI lives under `src/features/<feature>/components`. Use a scoped
kebab-case directory for each component and match the implementation filename
to its exported component (for example,
`components/user-role-form/UserRoleForm.tsx`). Route-level page components
coordinate data loading, permissions, navigation, and mutations; substantial
presentational sections such as filters and tables remain feature-owned
components. Form drawers derive visibility from their feature-local navigation
key instead of copying that value into synchronized React state.

Lazy route and layout boundaries render `src/shared/ui/route-loading` while
their bundles load, so navigation never presents an unexplained blank screen.

## Dependency Direction

- `shared` is independent and cannot import from `app`, `features`, or `layouts`.
- Features may consume `shared` and application context hooks.
- A feature importing another feature must use that feature's root public API.
- `app` and `layouts` compose feature public APIs and shared infrastructure.

ESLint enforces the shared-layer and cross-feature rules. Feature root
`index.ts` files define public APIs; single-file internal barrels are avoided.
Dedicated lazy route entrypoints remain public subpaths so route chunks stay
independent. ESLint also requires type-only imports and exports so runtime
dependencies remain explicit.

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

## Local API Boundary

The Bruno collection defines the executable HTTP boundary. Feature API modules
and types consume it, Pact tests protect selected consumer contracts, and the
dependency-free server under `server/` reads it directly for local development.
The mock server is a development adapter, not part of the browser application or
production deployment architecture. See the [collection guide](collection-guide.md).
