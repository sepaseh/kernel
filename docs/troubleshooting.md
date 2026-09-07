# Local troubleshooting

Start with the [development setup](development.md). Run commands from the
repository root and keep the frontend and API in separate terminals. Inspect
the failing request's URL, status, and `X-Request-Id` before changing settings.
The API prints redacted diagnostics to its terminal; correlate the request ID
using the [backend logging guide](backend-logging.md).

## Installation and startup

| Symptom                                                 | Check and resolution                                                                                                                                                               |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unsupported engine or Node cannot run server TypeScript | Select the Node.js 24 version in `.nvmrc`, then run `npm ci`. Check `node --version` in the same terminal used to start the API.                                                   |
| API exits with missing `BETTER_AUTH_SECRET`             | Set a locally generated value in `.env.local`; it is required even in development. The server command reads that file from the repository root.                                    |
| API exits with missing release/configuration values     | Check whether the process is running in production mode. Production requires `SERVER_RELEASE_ID` and the configuration listed in the backend guide.                                |
| Port already in use                                     | Stop only the local process you recognize or choose an unused port. For an API port change, align `PORT`, `BETTER_AUTH_URL`, and `VITE_API_BASE_URL`, then restart both processes. |
| UI opens but API calls fail                             | Start `npm run server`, verify the local `/health` response, and confirm the browser requests the intended `VITE_API_BASE_URL`. Vite does not start or proxy the API for you.      |
| Production build rejects environment                    | Supply valid `VITE_API_BASE_URL` and `VITE_APP_BASE_URL`; the latter must begin and end with `/`. See [Deployment](deployment.md).                                                 |

For the default local backend, these read-only checks confirm the runtime and
HTTP listener:

```bash
node --version
curl http://localhost:3000/health
```

In Windows PowerShell, use `Invoke-RestMethod http://localhost:3000/health` for
the HTTP check. Health does not verify login, every migration invariant, or
object-storage reads; test the affected operation as well.

## CORS and authentication

| Symptom                                          | Check and resolution                                                                                                                                                                                                    |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Browser reports a CORS error                     | `SERVER_ALLOWED_ORIGIN` must exactly match the frontend origin, including scheme and port. `localhost` and `127.0.0.1` differ. If Vite selected another port, stop the conflicting process or align the allowed origin. |
| Login succeeds but reload returns to login       | Inspect whether the browser accepted and sends the Better Auth cookie. Keep the frontend and API on consistent local hostnames; check `BETTER_AUTH_URL`, CORS, and browser cookie restrictions.                         |
| Seed account cannot sign in                      | Enable `SERVER_SEED_DEVELOPMENT_DATA=true` locally and restart the API. Use the documented mobile identifier. The seed creates a missing account; it does not reset an existing account's password or reactivate it.    |
| OTP request returns `500`                        | Local OTP requires an explicit `OTP_FIXED_CODE`. Without a delivery adapter issuance fails; production does not allow the fixed-code adapter.                                                                           |
| OTP request returns `429`                        | Wait for the 120-second resend window. Challenges are scoped by destination, purpose, and optional account binding.                                                                                                     |
| Recovery returns `400`                           | Check the mobile, OTP purpose, expiry, and password length. Password-length rejection happens before OTP consumption; a consumed or expired code cannot be replayed.                                                    |
| Page or action is unavailable; API returns `403` | Check the user's active roles and permission keys. Hiding a menu is a client policy; the API independently enforces permissions. Password resets for another user and system-admin changes require an administrator.    |
| Repeated protected `401` responses               | Inspect the refresh request and the single retry. An inactive account or invalid session remains unauthorized. Sign in again after resolving the account/session condition.                                             |

The [sequence diagrams](sequences.md) show which failures consume an OTP,
clear client authentication, or retry a request.

Email verification requires the same authenticated account and email address
used to request its challenge. If the email belongs to another account, the
update returns `400` after consuming the code. The old profile email remains;
request a new challenge after the resend window and use an available address.
See [Email verification](sequences.md#email-verification) for the complete flow.

A `409` when deleting, deactivating, or demoting a user can protect the last
active system administrator. Reload the current state and ensure another active
administrator remains before retrying an intended change. Self-deletion and
self-deactivation are separately rejected even when other administrators exist.
The [transaction diagram](sequences.md#final-administrator-protection) explains
why a state change by another request can invalidate an earlier view.

## Persistence and files

| Symptom                                       | Check and resolution                                                                                                                                                                                                              |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data appears missing after restart            | Confirm the same `DATABASE_URL` and working directory are used. Relative file URLs resolve from the process directory. The default database is `server/data/kernel.sqlite`.                                                       |
| SQLite is locked or migrations fail           | Stop duplicate local writers and inspect the migration failure. Verify directory write access and available disk space. Preserve the database before repair; do not delete it or rewrite applied migrations to silence the error. |
| Upload returns `413`                          | The default `UPLOAD_LIMIT_BYTES` is 5 MiB. Use a smaller file or deliberately change the local limit and restart the API.                                                                                                         |
| Public upload returns `403`                   | The account needs `settings.update` or system-administrator status; private upload requires an active authenticated account.                                                                                                      |
| Private upload has no URL                     | This is expected. The public content route does not expose private files, and a private-download endpoint is not implemented.                                                                                                     |
| Local public file URL fails                   | Check `BETTER_AUTH_URL`, the stored metadata, and the matching object beneath `LOCAL_STORAGE_PATH`. Restoring SQLite alone does not restore uploaded bytes.                                                                       |
| MinIO prevents startup                        | Start the local Compose service, select `STORAGE_DRIVER=minio`, and align MinIO settings. Non-loopback MinIO endpoints require TLS.                                                                                               |
| Switching storage driver makes old logos fail | Metadata retains its original bucket and object key. Changing drivers does not migrate existing files; use matching data/storage or plan an explicit migration.                                                                   |

For an isolated local reset experiment, choose a new database path and upload
directory while retaining the originals. For recovery, use the
[backup and restore procedure](backup-restore.md).

## Language and test failures

Language is initially read from browser preferences and then replaced by the
global application setting on a successful settings fetch. If a language switch
appears to revert after reload, check that global setting. API-owned messages
follow it as well. See [Localization](localization.md).

Browser tests and Storybook require a browser installation. Local Chromium
projects select stable Chrome; CI uses Playwright's Chromium. If browser startup
fails, check the browser selection in `playwright.config.ts` and
`vitest.config.ts`, then follow [Testing](testing.md).

For documentation-only changes, run `npm run format:check` and check relative
links and command names. Before any commit or push, the full gate in
[CONTRIBUTING.md](../CONTRIBUTING.md) still applies. An unavailable npm advisory
endpoint is a failed audit, not a clean report; retry when the service is
available rather than treating cached results as current.
