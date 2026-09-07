# Kernel API — Bruno Collection

This collection contains only the API operations used by the Kernel frontend,
along with the saved responses available for those operations.

## Open the collection

1. Install and open Bruno.
2. Choose **Open Collection**.
3. Select this `collection` directory.
4. Select the **development** environment.

## Included requests

- Authentication: register, login, OTP request, refresh token, forgot password,
  change password, and logout.
- Account: current account, profile and username updates, and email verification.
- Calendar: list, create, and delete configured dates.
- Roles: list, create, details, update, and delete.
- Permissions: role-scoped list.
- System settings: public details and authenticated update.
- Languages: authenticated list of supported languages.
- Files: multipart upload used by application logos.
- Users: list, create, details, update, delete, status, system-admin, password,
  and roles.

The frontend refreshes an expired access token through `/auth/refresh-token`,
so that request is included even though it is handled by the shared API client
rather than a feature page.

## First run

Run the login request with a local test account. Its post-response script stores
the returned access token as `access_token` in the active environment. The
remaining authenticated requests use that token.

Saved response files sit beside each request and are named after their HTTP
status code.

Every response from the Kernel API, including errors, preflight responses, and
file content, includes `X-Request-Id`. Clients may send a value of 1–128 ASCII
letters, digits, underscores, hyphens, or equals signs. Missing or invalid values
are replaced with a UUID. Values that would be redacted as sensitive text (for
example a mobile number or `token=...`) are also replaced, so the returned ID and
the logged ID always agree. The returned header is the identifier used in server
logs; it is correlation metadata, not proof of identity. CORS allows this request
header and exposes it on responses. JSON response bodies are unchanged.

Unexpected authentication-provider, database, and storage failures return `500`
with the translated generic internal-error message, never a stack or SDK payload.
Expected credential and validation failures retain their documented `400`
responses. In particular, login, registration, password change, and user creation
do not turn unexpected infrastructure failures into validation errors.

Do not store real passwords or access tokens in this shared collection.

## Local backend integration

The standalone backend implements these contracts under `server/src`. Run it
from the repository root with `npm run server`. Run `npm run test:contract`
after collection changes and `npm run server:test` after backend changes. Saved
responses do not drive runtime output; update both the collection and the
matching Hono route when behavior changes.

See the [collection and backend integration guide](../docs/collection-guide.md)
for source-of-truth rules, change sequencing, and ownership.
