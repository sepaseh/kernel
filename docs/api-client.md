# API Client

The API layer uses `src/shared/api/client.ts` as a small Axios wrapper around the configured backend base URL. Domain endpoint helpers live beside their feature.

## Features

- Backend base URL from `VITE_API_BASE_URL`
- In-memory bearer token injection
- Backend-owned HttpOnly refresh-cookie support
- Single-flight refresh and one-time request retry after protected `401` responses
- Automatic camelCase response conversion
- Automatic snake_case request body conversion
- Manual snake_case query parameter conversion where endpoints pass `params`
- Configurable unauthorized handler for `401` responses
- Typed helpers for JSON and blob responses

## Client Helpers

```ts
apiClient.get<T>(url, config);
apiClient.post<T>(url, data, config);
apiClient.put<T>(url, data, config);
apiClient.patch<T>(url, data, config);
apiClient.del<T>(url, config);
apiClient.blob(url, config);
```

## Starter Modules

| File                      | Purpose                                                  |
| ------------------------- | -------------------------------------------------------- |
| `features/auth/api.ts`    | Registration, login, OTP, password, and logout helpers   |
| `features/account/api.ts` | Current-account and profile helpers                      |
| `features/roles/api.ts`   | Role CRUD and permission list helpers                    |
| `features/users/api.ts`   | User CRUD, role assignment, status, and password helpers |
| `shared/api/client.ts`    | HTTP transport, refresh, retry, and data conversion      |
| `shared/api/token.ts`     | In-memory access-token state                             |

## Endpoint Examples

| Helper                      | Method   | Endpoint                  |
| --------------------------- | -------- | ------------------------- |
| `login`                     | `POST`   | `/auth/login`             |
| `getAccount`                | `GET`    | `/account/me`             |
| `changePassword`            | `POST`   | `/auth/change-password`   |
| `fetchUsers`                | `GET`    | `/users`                  |
| `fetchUser`                 | `GET`    | `/users/:id`              |
| `createUser`                | `POST`   | `/users`                  |
| `updateUser`                | `PATCH`  | `/users/:id`              |
| `deleteUser`                | `DELETE` | `/users/:id`              |
| `updateUserRoles`           | `PUT`    | `/users/:id/roles`        |
| `updateUserWorkspaces`      | `PUT`    | `/users/:id/workspaces`   |
| `updateUserPassword`        | `PUT`    | `/users/:id/password`     |
| `updateUserStatus`          | `PATCH`  | `/users/:id/status`       |
| `updateUserSystemAdmin`     | `PATCH`  | `/users/:id/system-admin` |
| `fetchUserRoleOptions`      | `GET`    | `/roles`                  |
| `fetchUserWorkspaceOptions` | `GET`    | `/workspaces`             |
| `fetchRoles`                | `GET`    | `/roles`                  |
| `fetchRole`                 | `GET`    | `/roles/:id`              |
| `createRole`                | `POST`   | `/roles`                  |
| `updateRole`                | `PATCH`  | `/roles/:id`              |
| `deleteRole`                | `DELETE` | `/roles/:id`              |
| `fetchPermissions`          | `GET`    | `/permissions`            |

## Data Shape Notes

- User names are split into `firstName` and `lastName`.
- Permission identifiers are server-provided dotted strings.
- `GET /permissions` returns resource groups containing display-ready permissions.
- User password reset is an authenticated action and does not have a dedicated permission key.

## Adding Modules

Add endpoint helpers to the owning feature's `api.ts`. Put only transport-level code used by multiple features in `src/shared/api`; do not create a global domain-service barrel.
