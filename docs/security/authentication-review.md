# Authentication and session review

Complete this checklist quarterly and before any authentication, authorization,
cookie, token, account-recovery, or identity-provider change.

## Client evidence

- [x] Access tokens remain in memory only.
- [x] Login and registration replace the in-memory access token.
- [x] Logout clears the access token even when the API request fails.
- [x] A single refresh request is shared by concurrent unauthorized responses.
- [x] Each failed request is retried at most once.
- [x] Refresh failure clears authentication state and returns to public routes.
- [x] Public authentication failures do not start refresh loops.
- [ ] Credentials and account data are absent from local storage, session
      storage, URLs, analytics, and observability reports.
- [ ] Redirect targets cannot send users to an untrusted origin.

## API and cookie evidence

- [ ] Refresh cookies use `HttpOnly`, `Secure`, an appropriate `SameSite`
      setting, the narrowest `Path`, and no overly broad `Domain`.
- [ ] Refresh tokens are rotated on use, detect reuse, expire, and are revoked
      on logout, password change, account disablement, and recovery.
- [ ] Credentialed state-changing requests have validated CSRF protection and
      origin checks.
- [ ] CORS allows only explicit application origins and credential requirements.
- [ ] Login, OTP, registration, recovery, refresh, and verification endpoints
      have rate limits and abuse monitoring.
- [ ] Password and OTP reset artifacts are single-use, short-lived, and never
      exposed in logs or URLs beyond the minimum required flow.
- [ ] Authorization is enforced server-side for every object and operation,
      including object ownership and tenant/workspace boundaries.
- [ ] Authentication responses and errors do not enable account enumeration.
- [ ] Session creation, refresh, revocation, privilege changes, and suspicious
      failures create protected audit events.

## Browser verification

- [ ] Cookies and cache headers are inspected in browser developer tools.
- [ ] Cross-origin requests are tested from an untrusted origin.
- [ ] Back-button, refresh, duplicate-tab, expiry, and clock-skew behavior are
      tested.
- [ ] Concurrent `401` responses, offline recovery, and API timeouts are tested.
- [ ] Logout is verified in every tab and the old refresh token cannot be used.
- [ ] Role removal takes effect without relying on stale client permissions.

Record the reviewed release, frontend and API commit SHAs, reviewer, date,
evidence links, findings, owners, severity, and due dates. Put sensitive
findings in a private security advisory rather than a public issue.

## Initial frontend review — 2026-07-30

- Reviewed release: `1.0.0`
- Frontend commit: `c8aa8a63fe2ca8a89f09898e3c95f6015f643e8f`
- API commit: Not supplied; API controls remain unverified and block release
  approval.
- Reviewer: Sepaseh
- Evidence:
  - [Token storage implementation](../../src/shared/api/token.ts)
  - [Authentication operations](../../src/features/auth/api.ts)
  - [Refresh and retry implementation](../../src/shared/api/client.ts)
  - [Authentication operation tests](../../src/features/auth/api.test.ts)
  - [Refresh, retry, and concurrency tests](../../src/shared/api/client.test.ts)
  - [Authenticated-layout cleanup tests](../../src/layouts/default/Default.test.tsx)

The frontend review confirmed:

- Access tokens are held in module memory and are not persisted.
- Login and registration set the token; logout clears it in a `finally` block.
- Unauthorized protected requests share one refresh operation, retry once, and
  clear authentication after terminal failure.
- Refresh and logout use credentialed HTTPS API requests.
- Unit tests cover concurrency, successful retry, refresh failure, retry-loop
  prevention, and cleanup.

Release approval still requires API-owner evidence for refresh-cookie flags,
rotation and reuse detection, CSRF and CORS enforcement, revocation, endpoint
rate limits, account-enumeration resistance, audit events, and server-side
authorization. These controls cannot be established from frontend source.

| Finding                                                                                         | Severity | Owner                        | Due date                        | Status                                        |
| ----------------------------------------------------------------------------------------------- | -------- | ---------------------------- | ------------------------------- | --------------------------------------------- |
| API authentication and session evidence, including the reviewed API SHA, has not been supplied. | Major    | API owner                    | Before `1.0.0` release approval | Open                                          |
| Same-origin script injection can read the in-memory access token and act as the user.           | Major    | Frontend and security owners | Reassess by 2026-10-30          | Risk accepted pending defense-in-depth review |

The residual client risk is that any successful same-origin script injection
can read the in-memory access token and act as the user. CSP, dependency
controls, output encoding, short token lifetime, and server-side authorization
remain required defense in depth.
