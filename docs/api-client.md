# API Client

The API layer uses `src/api/instance.ts` as a small Axios wrapper around the configured backend base URL.

## Features

- Backend base URL from `VITE_API_BASE_URL`
- Bearer token injection from the cookie key configured by `VITE_AUTH_TOKEN_KEY`
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

| File | Purpose |
| --- | --- |
| `auth.ts` | Login, current user, and current-user password change |
| `role.ts` | Role CRUD and permission list helpers |
| `user.ts` | User CRUD, role assignment, status, and password helpers |

## Endpoint Examples

| Helper | Method | Endpoint |
| --- | --- | --- |
| `login` | `POST` | `/api/v1/auth/login` |
| `me` | `GET` | `/api/v1/auth/me` |
| `changePassword` | `PUT` | `/api/v1/auth/password` |
| `fetchUsers` | `GET` | `/api/v1/users` |
| `createUser` | `POST` | `/api/v1/users` |
| `updateUser` | `PATCH` | `/api/v1/users/:id` |
| `updateUserRoles` | `PUT` | `/api/v1/users/:id/roles` |
| `updateUserPassword` | `PUT` | `/api/v1/users/:id/password` |
| `updateUserStatus` | `PUT` | `/api/v1/users/:id/status` |
| `fetchRoles` | `GET` | `/api/v1/roles` |
| `createRole` | `POST` | `/api/v1/roles` |
| `updateRole` | `PUT` | `/api/v1/roles/:id` |
| `deleteRole` | `DELETE` | `/api/v1/roles/:id` |
| `fetchPermissions` | `GET` | `/api/v1/permissions` |

## Data Shape Notes

- User names are split into `firstName` and `lastName`.
- Permissions use `PermissionKey` values from `src/types/permission.ts`.
- `PermissionProps` uses `groupName` for grouping permissions in forms.
- User password reset is an authenticated action and does not have a dedicated permission key.

## Adding Modules

Create a new file under `src/api`, export typed endpoint helpers, then re-export it from `src/api/index.ts` when it should be available through `@/api`.
