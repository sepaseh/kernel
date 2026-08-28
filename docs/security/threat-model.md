# Threat model

## Scope

This model covers the Kernel browser application, its static hosting layer, the
configured API origin, and the authentication/session exchange between them.
The backend implementation, identity provider, CI platform, and hosting
provider are dependencies and must maintain their own threat models.

The local mock API is development and test tooling outside the production trust
boundary. It uses synthetic data, a local signing secret, permissive reflected
CORS, and incomplete authorization semantics. It must not receive real
credentials or be deployed as a production service.

Review this document for authentication, authorization, data-flow,
infrastructure, or trust-boundary changes and at least quarterly.

## Assets

- Access and refresh credentials.
- User identity, profile, role, permission, and account data.
- Administrative operations for users and roles.
- Build artifacts, release identifiers, source code, and CI credentials.
- Application availability, integrity, audit evidence, and observability data.

## Trust boundaries and data flow

1. The browser downloads immutable static assets through the CDN or web server.
2. The browser sends HTTPS API requests to `VITE_API_BASE_URL`.
3. The access token exists only in JavaScript memory and is sent as a bearer
   header. It is not intentionally persisted in browser storage.
4. Refresh and logout requests include credentials, so the API controls the
   refresh cookie and its lifecycle.
5. Language and theme preferences cross the browser-storage boundary but must
   never contain credentials or sensitive account data.
6. CI builds artifacts and security reports without deployment credentials.
7. Sanitized browser errors and performance events may cross into the configured
   observability service.

## Primary threats and controls

| Threat                                     | Impact                                    | Current controls                                                     | Required verification                                                          |
| ------------------------------------------ | ----------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Script injection or compromised dependency | Credential theft and actions as the user  | CSP, dependency audit, CodeQL, no token persistence                  | Review CSP exceptions and dependency provenance                                |
| Stolen or replayed refresh cookie          | Session takeover                          | Credentialed refresh endpoint and server logout                      | Verify `HttpOnly`, `Secure`, `SameSite`, rotation, expiry, and revocation      |
| Cross-site request forgery                 | Unauthorized refresh, logout, or mutation | Same-origin deployment assumptions and API controls                  | Verify origin checks or CSRF tokens on every credentialed state change         |
| Broken access control                      | Unauthorized user or role administration  | Client route/action filtering                                        | Enforce every permission on the API; client checks are not security boundaries |
| Sensitive data exposure                    | Privacy or credential compromise          | HTTPS validation, redacted observability, memory-only access token   | Inspect logs, errors, caches, source maps, and browser storage                 |
| Malicious or vulnerable build input        | Compromised production artifact           | Pinned Actions, audit, CodeQL, SBOM/license checks, protected branch | Review workflow permissions and artifact provenance                            |
| Unsafe deployment or rollback              | Extended outage or vulnerable release     | Reproducible production build and immutable commit history           | Define deployment and rollback controls when hosting is selected               |
| Denial of service or automated abuse       | Unavailable authentication/API            | Client request cancellation where applicable                         | Verify API rate limits, quotas, timeouts, and alerting                         |
| Clickjacking or content-type confusion     | Deceptive UI or script execution          | Frame denial, MIME sniffing protection, CSP                          | Validate headers on CDN and direct routes                                      |
| Observability leakage                      | Secrets in monitoring systems             | Client-side redaction and optional endpoint                          | Test server-side scrubbing and access/retention policy                         |

## Abuse cases

- An unauthenticated user directly requests an administrative route or API.
- A user edits client state or permissions to reveal a hidden action.
- Multiple expired requests race to refresh a session or replay a token.
- An attacker submits oversized, malformed, or script-bearing form values.
- A malicious site causes credentialed cross-origin requests.
- A compromised dependency reads memory, DOM content, or browser storage.
- A release serves stale HTML that references missing or incompatible assets.
- A scanner or attacker repeatedly triggers OTP, login, registration, or
  password-recovery endpoints.

## Security invariants

- Authorization decisions are enforced by the API, never only by React.
- Production and security-test traffic use HTTPS.
- Access tokens are not written to local or session storage.
- Refresh cookies are inaccessible to JavaScript and narrowly scoped.
- Logout and terminal refresh failure clear client and server session state.
- Error reports, logs, build artifacts, and test evidence contain no secrets.
- Collection examples and mock-server fixtures contain synthetic data only.
- Production can return to a known-good build once deployment automation is
  introduced.

## Residual risks

The frontend cannot verify API authorization, cookie flags, refresh-token
rotation, revocation, rate limiting, audit logging, database isolation, or
backend input validation. These remain release blockers until confirmed through
backend evidence, integration tests, or a documented security review.
