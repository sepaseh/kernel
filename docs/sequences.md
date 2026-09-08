# Runtime sequences

These diagrams describe the current implementation. HTTP paths and payloads
follow the [Bruno collection](collection-guide.md); transport details belong to
the [API client](api-client.md), and persistence to the
[database schema](database-schema.md). Arrows group related operations rather
than list every SQL query or middleware call.

## Flow index

| Flow                                                              | Preconditions                                                                                          | Expected outcome                                                                       |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| [Password login](#password-login)                                 | Active account, valid mobile identifier and password                                                   | Session cookie is set, token is held in memory, and the UI navigates to the dashboard  |
| [Session recovery](#session-recovery-and-one-time-retry)          | A protected request returns `401`; a valid cookie session is needed for recovery                       | Requests waiting for the same refresh retry once with its result                       |
| [Password recovery](#password-recovery-with-otp)                  | Existing credential account and configured OTP delivery; local development uses the fixed-code adapter | Credential password is updated; signing in is a separate action                        |
| [Email verification](#email-verification)                         | Active authenticated account and configured OTP delivery                                               | Verified profile email is stored and the UI reloads the account                        |
| [File upload](#file-upload-and-public-read)                       | Active account, nonempty file within the size limit, and permission for public uploads                 | Object and metadata are stored; public uploads return a URL                            |
| [Final-administrator protection](#final-administrator-protection) | Actor has the operation's permission and the target exists                                             | An allowed mutation commits, or `409` rejects removal of the last active administrator |

Numbered messages restart in each diagram. Phase notes identify logical stages
without implying a transaction; the final-administrator diagram marks its
transaction explicitly. Failure paths and limitations are documented beside each flow. The
[implementation and coverage index](#implementation-and-existing-coverage)
links to the current code and existing tests.

## Password login

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Login page
    participant Client as API client and token memory
    participant API as Hono auth routes
    participant Auth as Better Auth
    participant DB as SQLite
    User->>UI: Submit mobile identifier and password
    UI->>Client: login(values)
    Client->>API: POST /auth/login with credentials enabled
    API->>DB: Find active user by mobile
    alt Unknown or inactive user
        API-->>Client: 400 invalid credentials
        Client-->>UI: Display translated error
    else Active user
        API->>Auth: signInEmail with internal auth identity
        Auth->>DB: Verify credential and create session on success
        alt Password rejected
            Auth-->>API: Authentication rejection
            API-->>Client: 400 invalid credentials
            Client-->>UI: Display translated error
        else Login succeeds
            Auth-->>API: Session token and cookie headers
            API-->>Client: 200 access_token and Set-Cookie
            Note over UI,Client: Browser owns the HttpOnly cookie; JavaScript cannot read it
            Client->>Client: Convert access_token and store in memory
            Client-->>UI: Login completed
            UI->>UI: Navigate to dashboard
        end
    end
```

The identifier currently accepts an Iranian mobile number matching `09` plus
nine digits. An API login uses the user's internal `auth_email`, independently
of the optional verified profile `email`. Unexpected infrastructure failures
return a generic `500`, with diagnostics in backend logs.

Sources: `src/features/login/Login.tsx`, `src/features/auth/api.ts`,
`server/src/routes/auth.ts`, and `server/src/auth.ts`.

## Session recovery and one-time retry

```mermaid
sequenceDiagram
    autonumber
    participant UI as Protected page or account loader
    participant Client as Shared API client
    participant API as Hono API
    participant Auth as Better Auth and session store
    UI->>Client: Protected request A
    Client->>API: Request with in-memory bearer token when available
    API-->>Client: 401
    Client->>Client: Mark A retried and create shared refresh promise
    Client->>API: POST /auth/refresh-token with browser cookies
    opt Request B returns 401 before refresh settles
        UI->>Client: Protected request B
        Client->>API: Request with current in-memory token when available
        API-->>Client: 401
        Client->>Client: Mark B retried and await the existing refresh promise
    end
    API->>Auth: getSession(request headers)
    alt Session exists
        Auth-->>API: Current session
        API-->>Client: 200 access_token = current session token
        Client->>Client: Replace in-memory token
        loop Each request waiting for this refresh
            Client->>API: Retry original request once
            alt Retry succeeds
                API-->>Client: Successful response
                Client-->>UI: Converted response data
            else Retry returns 401
                API-->>Client: 401
                Client->>Client: Clear token and invoke unauthorized handler
                Client-->>UI: Authentication error; return to login
            end
        end
    else Session missing or invalid
        Auth-->>API: No session
        API-->>Client: 401
        Client->>Client: Clear token and invoke unauthorized handler
        Client-->>UI: Authentication error; return to login
    end
```

This also supports restoring a session after a page reload when token memory
is empty. The refresh endpoint returns the existing Better Auth session token;
it does not implement a separate rotating refresh-token family or replay
detection. A network/server failure during refresh also clears client
authentication. Other errors from the retried request follow normal API error
handling. Public login, registration, OTP, recovery, and refresh requests do not
start this retry cycle.

Terminal refresh failure clears client state; it does not delete the server
session. Successful logout explicitly deletes the current session, and the
frontend clears its token even if the logout request fails. See the
[authentication review](security/authentication-review.md) for deployment
verification still required.

Sources: `src/shared/api/client.ts`, `src/features/auth/api.ts`,
`src/layouts/default/Default.tsx`, and `server/src/routes/auth.ts`.

The shared promise belongs to one loaded API-client module, normally one browser
tab. It is cleared when refresh settles. Another tab, or a later `401` after
that promise has cleared, can start a separate refresh. The loop depicts a
per-request retry limit, not serial execution: waiting requests resume
independently. A shared refresh failure invokes the unauthorized handler once
for that failure group.

## Password recovery with OTP

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Recovery form and API client
    participant API as Hono auth routes
    participant DB as SQLite
    participant Auth as Better Auth password helpers
    Note over User,DB: Phase 1 - Issue a recovery challenge
    User->>UI: Request code for mobile number
    UI->>API: POST /auth/otp-request with purpose forgot_password
    API->>DB: Look up latest challenge for destination and purpose
    alt Requested within the 120-second resend window
        API-->>UI: 429
    else Local OTP adapter configured
        API->>DB: Insert code hash with 120-second expiry
        API-->>UI: 200 expires_in and remaining_seconds
        Note over User,API: Local developer uses configured OTP_FIXED_CODE; no SMS is sent
    end
    Note over User,DB: Phase 2 - Consume challenge and change password
    User->>UI: Submit mobile, code, and new password
    UI->>API: POST /auth/forgot-password
    API->>Auth: Read configured password length limits
    alt Password length invalid
        API-->>UI: 400; OTP remains unconsumed
    else Password length valid
        API->>DB: Find unconsumed challenge; check hash and expiry
        alt Invalid, expired, or already consumed
            API-->>UI: 400
        else Valid challenge
            API->>DB: Conditionally mark challenge consumed
            API->>DB: Find account by mobile
            API->>Auth: Hash new password
            API->>DB: Update credential account password
            API-->>UI: 200 on successful update
        end
    end
```

The final account lookup and password update can still fail after OTP
consumption. These operations are not one database transaction; do not infer
that every failed recovery leaves the code reusable. Recovery does not log the
user in or explicitly revoke existing sessions. A missing OTP adapter causes a
server error. Production rejects `OTP_FIXED_CODE` and requires an implemented
delivery adapter before using OTP flows.

Source: `server/src/routes/auth.ts`. Password-policy rejection and single-use
behavior are covered in `server/src/auth-invariants.test.ts`.

## Email verification

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Account page and API client
    participant API as Hono account routes
    participant OTP as Shared OTP helpers
    participant DB as SQLite
    Note over User,DB: Phase 1 - Request an account-bound challenge
    User->>UI: Enter a new profile email
    UI->>API: POST /account/request-email-verification with email
    API->>API: Authenticate active account; normalize and validate email
    API->>OTP: issueOtp(email, verify_email, account.id)
    OTP->>DB: Check latest challenge for this email, purpose, and subject
    alt Resend window has not elapsed
        OTP-->>API: Rate limit rejection
        API-->>UI: 429; profile email is unchanged
    else Challenge can be issued
        OTP->>DB: Store code hash, subject, and 120-second expiry
        OTP-->>API: expires_in and remaining_seconds
        API-->>UI: 200; start resend countdown
    end
    Note over User,DB: Phase 2 - Verify and assign the email
    User->>UI: Submit the same email and its code
    UI->>API: POST /account/verify-email with email and otp
    API->>API: Authenticate active account; normalize email
    API->>OTP: consumeOtp(email, verify_email, account.id)
    OTP->>DB: Find unconsumed challenge for that exact scope
    alt Missing, expired, mismatched, or consumed challenge
        OTP-->>API: Invalid-code rejection
        API-->>UI: 400; profile email is unchanged
    else Challenge matches
        OTP->>DB: Conditionally mark consumed if still unconsumed
        alt Another verification already consumed it
            DB-->>OTP: No row updated
            OTP-->>API: Invalid-code rejection
            API-->>UI: 400
        else Consumption succeeds
            OTP-->>API: Accepted
            API->>DB: Update user.profileEmail, mapped to SQL email
            alt Email already belongs to another account
                DB-->>API: Unique constraint failure
                API-->>UI: 400; old email retained, code consumed
            else Update succeeds
                API-->>UI: 200 with no body
                UI->>API: GET /account/me
                API->>DB: Read current account and permissions
                API-->>UI: Account with verified profile email
                UI->>UI: Update account state and clear OTP input
            end
        end
    end
```

Both endpoints require authentication; there is no additional role permission.
Invalid email syntax at issuance returns `400`, and an invalid/inactive session
returns `401`. The shared client's normal refresh rules apply to these protected
requests. The local adapter uses `OTP_FIXED_CODE` and sends no email; without
an adapter issuance fails with `500`.

The challenge scope is `(destination=email, purpose=verify_email,
subject=account.id)`. Changing the email or verifying from another account
cannot consume the originally issued challenge. Verification checks the latest
unconsumed challenge in that scope, its hash, and its expiry. Consumption uses
a conditional write so concurrent verification cannot consume the same row
twice.

OTP consumption and the profile update are separate writes. An email uniqueness
failure preserves the old email but consumes the code; the user must request
a new challenge after the resend window. A failure while reloading
`/account/me` can occur after the email has already been saved. This flow changes
SQL `user.email` (`profileEmail` in Drizzle), not the internal `auth_email` or
Better Auth's `email_verified` flag.

Contracts: [Request Email Verification](../collection/account/request-email-verification/index.bru)
and [Verify Email](../collection/account/verify-email/index.bru).
Sources: `src/features/account/Account.tsx`, `src/features/account/api.ts`,
`server/src/routes/account.ts`, and the shared OTP helpers in
`server/src/routes/auth.ts`.

## File upload and public read

```mermaid
sequenceDiagram
    autonumber
    participant UI as Upload control
    participant Client as Shared API client
    participant API as Hono file routes
    participant Storage as Local filesystem or MinIO
    participant DB as SQLite
    Note over UI,DB: Phase 1 - Validate and persist the upload
    UI->>Client: uploadFile(file, visibility)
    Client->>API: POST /files with multipart FormData
    API->>API: Authenticate; validate visibility, permissions, and size
    alt Request rejected
        API-->>Client: 400, 401, 403, or 413
        Client-->>UI: Error
    else Request accepted
        API->>Storage: Store bytes under generated object key
        Storage-->>API: Bucket and object key
        API->>DB: Insert file metadata and creator reference
        alt Metadata write fails
            API->>Storage: Attempt compensating object deletion
            Note over API,Storage: Cleanup failure is logged; original metadata error is retained
            API-->>Client: 500
        else Metadata stored
            API-->>Client: 201 id, content_type, visibility, optional public URL
            Client-->>UI: Converted FileResource
        end
    end
    opt Read a successfully uploaded public file
        Note over UI,Storage: Phase 2 - Read through the selected public URL
        alt Local storage URL
            UI->>API: GET /files/:fileId/content
            API->>DB: Verify metadata is public
            API->>Storage: Read object bytes
            API-->>UI: Content with safe response headers
        else MinIO public URL
            UI->>Storage: GET public object directly
            Storage-->>UI: Object bytes
        end
    end
```

Any active authenticated user can upload a private file. Public uploads require
`settings.update` or system-administrator status. The default limit is 5 MiB.
Storage-write failure returns `500` before metadata insertion. Private uploads
have no returned URL, and the public content route returns `404` for private or
missing metadata. There is no private-download API in the current route set.

Sources: `src/shared/api/file.ts`, `server/src/routes/files.ts`, and
`server/src/storage/`. Database and object storage are separate resources;
[backups](backup-restore.md) must preserve both.

## Final-administrator protection

Deleting, deactivating, or demoting an active system administrator must leave
another active system administrator. The operation's authorization is checked
first; the target's current status, capability, administrator count, and mutation
are then handled in one database write transaction.

| Operation                                                        | Required actor access                  | Additional guard                                                        |
| ---------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------- |
| `DELETE /users/:userId`                                          | `users.delete` or system administrator | Actor cannot delete themselves                                          |
| `PATCH /users/:userId/status` with `status=inactive`             | `users.update` or system administrator | Actor cannot deactivate themselves                                      |
| `PATCH /users/:userId/system-admin` with `is_system_admin=false` | System administrator                   | Self-demotion is allowed only when another active administrator remains |

```mermaid
sequenceDiagram
    autonumber
    participant Client as User-management API client
    participant API as Hono user routes
    participant Other as Other authorized API requests
    participant DB as SQLite
    Note over Client,DB: Phase 1 - Authorize and validate the request
    Client->>API: Delete, deactivate, or demote target user
    API->>API: Authenticate actor and check required permission
    API->>DB: Initial target lookup
    DB-->>API: Target exists
    API->>API: Validate payload and applicable self-change guard
    opt Other requests commit before the pending write transaction
        Other->>DB: Promote or activate the target
        Other->>DB: Demote the previous administrator
        Note over API,DB: Initial target state is now stale; target may be the last active admin
    end
    rect rgb(240, 245, 250)
        Note over API,DB: Phase 2 - One write transaction
        API->>DB: Begin transaction and re-read target
        DB-->>API: Current target status and administrator flag
        opt Mutation would remove an active administrator
            API->>DB: Count users with is_system_admin=true and status=active
            DB-->>API: Current active-administrator count
        end
        alt Target is an active administrator and count is at most one
            API->>DB: Abort transaction with final-admin conflict
            API-->>Client: 409; pending mutation is not applied
        else Final-admin guard allows the change
            API->>DB: Apply deletion or status/capability update
            DB-->>API: Mutation succeeds; commit
            API-->>Client: 200 with no body
        end
    end
```

The optional interleaving illustrates the regression covered by the existing
tests: other authorized requests make the target the last active administrator
after the pending request's initial reads. Re-reading the target inside the
transaction prevents the stale non-admin/inactive value from bypassing the
guard. Rejecting the pending request does not undo those other committed
requests. Concurrent mutation of different targets is subject to the same
in-transaction active-administrator count.

Missing or inactive actor sessions return `401`; insufficient access returns
`403`; invalid status/capability input returns `400`; a missing target returns
`404`. The target can also disappear before its transactional re-read, producing
`404`. Self-deletion and self-deactivation return `409` before mutation. Passing
the final-admin guard does not guarantee every write succeeds: storage or
foreign-key failures still follow the route's normal error handling and roll
back the transaction. The existing schema restricts deletion of users referenced
by uploaded file metadata; that database error is not explicitly mapped to
`409` by this route.

On conflict, inspect or reload the current user state instead of treating an
earlier frontend permission snapshot as authoritative. There is no automatic
retry for `409` in the shared client.

Contracts: [Delete User](../collection/users/delete/index.bru),
[Update User Status](../collection/users/update-status/index.bru), and
[Update User System Administrator](../collection/users/update-system-admin/index.bru).
Source: `server/src/routes/users.ts`.

## Implementation and existing coverage

These links identify existing evidence; the diagrams also explain runtime paths
that are not all individually asserted by those tests. Updating a diagram does
not establish new test coverage.

| Flow                | Implementation                                                                                         | Existing coverage                                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Login               | [Auth routes](../server/src/routes/auth.ts), [frontend auth API](../src/features/auth/api.ts)          | [Backend API tests](../server/src/app.test.ts): seeded login and account reads; [auth API tests](../src/features/auth/api.test.ts): frontend token handling                                            |
| Shared refresh      | [API client](../src/shared/api/client.ts)                                                              | [Client tests](../src/shared/api/client.test.ts): concurrent `401`, shared success/failure, and one retry per request                                                                                  |
| Password recovery   | [Auth routes](../server/src/routes/auth.ts)                                                            | [Authentication invariants](../server/src/auth-invariants.test.ts): password-length rejection, OTP reuse after that rejection, and replay rejection                                                    |
| Email verification  | [Account routes](../server/src/routes/account.ts), [account page](../src/features/account/Account.tsx) | [Backend API tests](../server/src/app.test.ts): optional email before verification and stored email afterward; [account API tests](../src/features/account/api.test.ts): helper endpoints and payloads |
| File upload         | [File routes](../server/src/routes/files.ts)                                                           | [Backend API tests](../server/src/app.test.ts): upload and public/private reads; [request logging tests](../server/src/request-logging.test.ts): storage/metadata failures and cleanup                 |
| Final administrator | [User routes](../server/src/routes/users.ts)                                                           | [Authentication invariants](../server/src/auth-invariants.test.ts): all three removals after concurrent promotion/activation, rejection, and allowed changes when another administrator remains        |
