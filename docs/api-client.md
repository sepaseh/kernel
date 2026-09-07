# API Client

The API layer uses `src/shared/api/client.ts` as a small Axios wrapper around the configured backend base URL. Domain endpoint helpers live beside their feature.

## Features

- Backend base URL from `VITE_API_BASE_URL`
- In-memory bearer token injection
- Backend-owned HttpOnly refresh-cookie support
- Single-flight refresh and one-time request retry after protected `401` responses
- Automatic camelCase response conversion
- Automatic snake_case request body conversion
- Omission of `null` object fields during request and response conversion
- Manual snake_case query parameter conversion where endpoints pass `params`
- Configurable unauthorized handler for `401` responses
- Typed helpers for JSON, `FormData`, and blob responses

## Client Helpers

```ts
apiClient.get<T>(url, config);
apiClient.post<T>(url, data, config);
apiClient.put<T>(url, data, config);
apiClient.patch<T>(url, data, config);
apiClient.del<T>(url, config);
apiClient.blob(url, config);
```

Paginated list queries extend the shared `ListQuery` contract, which owns the
optional string-valued `offset` and `size` URL parameters. Feature query types
add only their domain-specific filters.

`post` and `put` accept either plain request objects or `FormData`. Wire-case
conversion applies recursively to plain objects; browser-native `FormData`
instances pass through unchanged. Object fields with a `null` value are omitted
at this boundary and represented as optional fields in domain models.

## Starter Modules

| File                       | Purpose                                                  |
| -------------------------- | -------------------------------------------------------- |
| `features/auth/api.ts`     | Registration, login, OTP, password, and logout helpers   |
| `features/account/api.ts`  | Current-account and profile helpers                      |
| `features/calendar/api.ts` | Calendar date list, creation, and deletion helpers       |
| `features/roles/api.ts`    | Role CRUD and permission list helpers                    |
| `features/settings/api.ts` | Application settings, available languages, and updates   |
| `features/users/api.ts`    | User CRUD, role assignment, status, and password helpers |
| `shared/api/client.ts`     | HTTP transport, refresh, retry, and data conversion      |
| `shared/api/file.ts`       | Reusable multipart file upload helper                    |
| `shared/api/token.ts`      | In-memory access-token state                             |

## Endpoint Examples

| Helper                      | Method   | Endpoint                  |
| --------------------------- | -------- | ------------------------- |
| `login`                     | `POST`   | `/auth/login`             |
| `getAccount`                | `GET`    | `/account/me`             |
| `changePassword`            | `POST`   | `/auth/change-password`   |
| `fetchCalendarDates`        | `GET`    | `/calendar`               |
| `createCalendarDate`        | `POST`   | `/calendar`               |
| `deleteCalendarDate`        | `DELETE` | `/calendar/:date`         |
| `fetchUsers`                | `GET`    | `/users`                  |
| `fetchUser`                 | `GET`    | `/users/:id`              |
| `createUser`                | `POST`   | `/users`                  |
| `updateUser`                | `PATCH`  | `/users/:id`              |
| `deleteUser`                | `DELETE` | `/users/:id`              |
| `updateUserRoles`           | `PUT`    | `/users/:id/roles`        |
| `updateUserPassword`        | `PUT`    | `/users/:id/password`     |
| `updateUserStatus`          | `PATCH`  | `/users/:id/status`       |
| `updateUserSystemAdmin`     | `PATCH`  | `/users/:id/system-admin` |
| `fetchRoles`                | `GET`    | `/roles`                  |
| `fetchRole`                 | `GET`    | `/roles/:id`              |
| `createRole`                | `POST`   | `/roles`                  |
| `updateRole`                | `PATCH`  | `/roles/:id`              |
| `deleteRole`                | `DELETE` | `/roles/:id`              |
| `fetchPermissions`          | `GET`    | `/roles/permissions`      |
| `fetchApplicationSettings`  | `GET`    | `/settings`               |
| `fetchLanguages`            | `GET`    | `/languages`              |
| `updateApplicationSettings` | `PUT`    | `/settings`               |
| `uploadFile`                | `POST`   | `/files`                  |

## Data Shape Notes

- User names are split into `firstName` and `lastName`.
- User-list name filtering uses independent `firstName` and `lastName` query
  fields rather than a combined name search.
- User responses expose assigned `roles` as objects containing `id` and `name`;
  the role-update request continues to send `roleIds` as a command payload.
- User creation does not send `status`; the backend initializes it to `active`
  and returns the required field in the created user response.
- User creation and administrator resets generate 16-character temporary
  passwords compatible with the backend policy; password fields remain strings
  and the feature API request shapes are unchanged.
- Permission identifiers are server-provided dotted strings.
- `GET /roles/permissions` returns the calendar, role, settings, and user permission groups supported
  by Kernel, with display-ready titles.
- Application settings contain the active language, light/dark logos, and the
  light/dark Ant Design color palettes. Updating them applies those values to
  the current session immediately; `CoreProvider` reloads them at startup.
- The language catalog includes Arabic, German, English, Spanish, Persian,
  French, Italian, Portuguese, Russian, and Turkish. Locale files may be filled
  incrementally; missing keys fall back to Persian.
- Administrator password resets require a system administrator; public recovery
  uses a mobile-bound OTP. Both enforce Better Auth's configured password lengths
  and report policy rejection as `400`. Recovery leaves the OTP usable after a
  password-length rejection.
- Deleting, deactivating, or demoting the final active system administrator
  reports `409`, including when concurrent requests change the target's status
  or capability. Existing `Promise<void>` helpers and request types remain
  unchanged; the transport surfaces the server's localized error message.

## Error correlation

The client retains a valid `X-Request-Id` response header as `error.requestId`
when converting an HTTP error into an Error. Browser `reportError` includes that
identifier in its sanitized context, preserving backend correlation without
changing payload shapes or user-visible error messages. IDs must satisfy the
bounded format in [Backend logging](backend-logging.md). Unexpected backend
provider/database/storage errors return a generic 500, while expected validation
and credential rejections retain their existing statuses.

## Adding Modules

Add endpoint helpers to the owning feature's `api.ts`. Put only transport-level code used by multiple features in `src/shared/api`; do not create a global domain-service barrel.

Update the corresponding Bruno operation and saved response before changing an
observable endpoint contract. Update the matching Hono route in the same change;
see the [collection guide](collection-guide.md) and
[backend guide](../server/README.md).
