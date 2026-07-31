# Architecture

## Application Entry

`src/main.tsx` mounts the React application. `src/App.tsx` composes the top-level providers and route tree.

The main runtime pieces are:

- `src/providers/core/Core.tsx` for language, theme, current route, and authenticated user state.
- `src/providers/antd/Antd.tsx` for Ant Design locale, direction, and theme tokens.
- `src/Routes.tsx` for browser routing.

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

Route definitions are centralized in `src/config/routes.ts`. The router is created in `src/Routes.tsx` with `createBrowserRouter`.

The app uses two layouts:

- `AuthLayout` for `/auth`
- `DefaultLayout` for authenticated application pages

`SetCurrentRoute` wraps each route element and updates `CoreProvider` with the active route key. Navigation components should prefer `routeTree` rather than hard-coded paths.

## Pages

The starter pages are:

- Login
- Account profile and credentials
- Empty dashboard
- Roles and permissions
- Users
- Not found

Route-level logic should stay in `src/pages`. Shared presentation and reusable view helpers should be extracted to `src/components`.

## State and Persistence

The app keeps lightweight UI preferences in local storage through helpers in `src/storage`.

Access tokens remain in frontend memory and are attached to protected API
requests as bearer tokens. The backend owns the refresh token in an HttpOnly
cookie. On application startup, a protected account request can trigger one
refresh request to restore an access token without exposing the refresh token
to JavaScript.

## Styling

Global styles live in `src/styles`. The application bundles the Vazirmatn
variable WOFF2 from `src/assets/fonts/vazirmatn` and uses weights 100–900 with
`font-display: swap`. Vite fingerprints the local asset during production
builds; the application does not depend on an external font provider.

Prefer Ant Design components and theme tokens for new UI so layout, spacing, RTL behavior, and dark/light themes stay consistent.
