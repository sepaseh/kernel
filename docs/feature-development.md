# Adding a feature, page, and permission

Follow an existing feature such as `src/features/calendar` for a small read and
update flow, or `src/features/users` for filtered lists and forms. This guide is
a change recipe; the example names below do not describe an implemented feature.

## Define the contract and backend

1. Define the operations, access rules, request fields, response bodies, and
   failure cases in `collection/` first. Follow the
   [collection guide](collection-guide.md).
2. If persistence changes, update `server/src/db/schema.ts`, generate and review
   a migration with `npm run server:generate -- --name descriptive_name`, and
   update the [schema reference and ERD](database-schema.md).
3. Implement a route module under `server/src/routes/` and mount it in
   `server/src/app.ts`. Use `authenticate` from `server/src/http.ts` for protected
   operations. A read and its mutations may require different permissions.
4. Add backend coverage using isolated database/storage fixtures. Include
   unauthenticated, insufficient-permission, invalid-input, and successful cases.

Use `ApiError` and existing request validation helpers for errors. Add translated
backend messages through `server/src/i18n.ts` and `server/src/i18n/locales.ts`.
Use the request logger for bounded operational metadata; follow
[Backend logging](backend-logging.md) when introducing a new event.

## Build the feature module

A typical feature owns:

```text
src/features/example/
  api.ts                  Typed calls through the shared API client
  api.test.ts             Wire contract and response/error handling
  types.ts                Domain types and request/query contracts
  Example.tsx             Page composition and behavior
  Example.stories.tsx     Meaningful page states
  index.ts                Public feature API
  components/             Forms or UI with an independent responsibility
```

Use `apiClient` from `src/shared/api`; it already handles bearer tokens,
credentialed cookies, refresh/retry, and JSON case conversion. Use `ListQuery`
for shared pagination and convert query parameter keys where needed. Keep
nullable response properties optional as described in [API client](api-client.md).

Export the page and shared domain contracts through the feature's root
`index.ts`. Cross-feature consumers use that public API. Put reusable generic
infrastructure in `shared`, which cannot import from features, layouts, or app.
Keep page-only UI inline until it has a separate responsibility.

## Register the page and navigation

1. Add an entry to `routeTree` in `src/app/config/routes.ts`, specifying `path`,
   `layout`, `permissions.access`, and named action permissions. A menu entry
   also needs a translated `label`.
2. Add the lazy page import and its `pageRegistry` entry in `src/app/Routes.tsx`.
   Adding a route config alone does not register the rendered page.
3. Add the route to `navigationTree` if it should appear in the menu. Reference
   the route key instead of copying its URL or label.
4. Derive action flags with `getRoutePermissions(routeKey, user)` and use them
   to guard UI actions. The API must enforce the same policy independently.
5. Add translation keys to every supported locale and use existing Ant Design
   controls, theme tokens, and local icons. Check keyboard access, empty/error
   states, light/dark themes, and LTR/RTL layouts.

For a new permission, update all of these together:

| Boundary            | Location and responsibility                                                 |
| ------------------- | --------------------------------------------------------------------------- |
| HTTP contract       | Bruno operation notes and `/roles/permissions` examples                     |
| Backend catalog     | `permissionKeys` and `permissionGroupDefinitions` in `server/src/domain.ts` |
| Backend enforcement | `authenticate(context, { permission: ... })` in each owning route           |
| Backend labels      | `server/src/i18n.ts` and `server/src/i18n/locales.ts`                       |
| Frontend type       | `PermissionKey` in `src/features/roles/types.ts`                            |
| Route and actions   | `routeTree` in `src/app/config/routes.ts`                                   |
| Fixtures and tests  | Relevant MSW handlers, test factories, contracts, stories, and access tests |

`SYSTEM_ADMIN` is an account capability that bypasses assignable role
permissions. Administrator password resets and system-administrator changes
use `authenticate(context, { systemAdmin: true })`; they are not role permission
keys. Use `authenticated` for a page that needs a signed-in account but no
domain permission, and `public` for a page that requires neither.

Adding a catalog key does not grant it to existing deployed roles. Plan role
assignment explicitly. The optional local development seed grants all known
permission keys to its sample role; that seed is not a production migration.

## Verify and document

Start with focused API/component tests (`npm run test -- path/to/file.test.ts`)
and `npm run server:test` for changed backend behavior. Use
`npm run test:contract` when the consumer boundary changes. Add stories and
tests according to [Component coverage](component-coverage.md); use browser
journeys for critical cross-page flows as described in [Testing](testing.md).

Update the matching source-of-truth documents in the
[documentation map](README.md), including routes in the root README when
needed. Keep affected [sequence diagrams](sequences.md) aligned with runtime
behavior. Before committing or pushing, run the complete gate in
[CONTRIBUTING.md](../CONTRIBUTING.md).
