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
- Roles: list, create, details, update, and delete.
- Permissions: list.
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

Do not store real passwords or access tokens in this shared collection.

## Local mock integration

The development mock server reads this directory directly at startup. Run it
from the repository root with `npm run server`; changes to requests or saved
responses take effect after restarting the process. Run `npm run server:test`
after contract changes.

See the [collection and mock integration guide](../docs/collection-guide.md) for
source-of-truth rules, change sequencing, error simulation, and limitations.
