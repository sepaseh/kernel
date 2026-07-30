# Authentication and session review

Complete this checklist quarterly and before any authentication, authorization,
cookie, token, account-recovery, or identity-provider change.

## Client evidence

- [ ] Access tokens remain in memory only.
- [ ] Login and registration replace the in-memory access token.
- [ ] Logout clears the access token even when the API request fails.
- [ ] A single refresh request is shared by concurrent unauthorized responses.
- [ ] Each failed request is retried at most once.
- [ ] Refresh failure clears authentication state and returns to public routes.
- [ ] Public authentication failures do not start refresh loops.
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

The residual client risk is that any successful same-origin script injection
can read the in-memory access token and act as the user. CSP, dependency
controls, output encoding, short token lifetime, and server-side authorization
remain required defense in depth.
