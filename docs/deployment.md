# Deployment

This repository includes an nginx configuration for serving the built frontend
with client-side routing, long-lived asset caching, and required security
headers.

Kernel is a project template and does not have an active deployment environment
of its own. The staging validation, deployment smoke, and DAST workflows are
reusable templates that run only when started manually. A downstream project
may configure and automate them after it has real, authorized deployment
targets.

The collection-driven server under `server/` is excluded from the production
deployment architecture. Its development-only CORS allowlist, local signing
secret, placeholder refresh cookie, and non-persistent mutations do not make it
a production API substitute. Do not deploy it or expose it to untrusted
networks.

## Production Build

Create a production build:

```bash
npm run build
```

The generated files are written to `dist/`.

Preview the production build locally:

```bash
npm run preview
```

## Environment Variables

Vite reads environment variables at build time. Production builds fail when
either required value is missing or invalid.

Required values usually include:

```env
VITE_API_BASE_URL=http://api.example.com
VITE_APP_BASE_URL=/
```

`VITE_APP_BASE_URL` must match the path where the app is served. For example, if the app is hosted under `/app/`, set:

```env
VITE_APP_BASE_URL=/app/
```

`VITE_API_BASE_URL` must be an absolute URL. `VITE_APP_BASE_URL` must
start and end with `/`; use `/` when the application is served at the domain
root.

## Observability

Set `VITE_RELEASE_ID` to an immutable deployment identifier, such as the Git
commit SHA. This release is included with every error and performance event.

To deliver events, set `VITE_OBSERVABILITY_URL` to an HTTP endpoint that
accepts JSON `POST` requests. If it is omitted, instrumentation remains active
but no events leave the browser. Reports include sanitized application errors,
unhandled failures, React component failures, largest contentful paint,
cumulative layout shift, and long tasks. Credential-like values, email
addresses, and URL query values are redacted before delivery.

## nginx

Build the application, copy `dist/` to `/usr/share/nginx/html`, and install
`nginx.conf` as the server configuration. It supports client-side routing by
falling back to `index.html`.

When adding routes in React, no nginx route changes are normally required as long as the fallback remains in place.

## Security headers

The nginx configuration applies:

- Content Security Policy restricted to same-origin application resources and
  HTTP API connections
- Denial of framing through CSP and `X-Frame-Options`
- MIME sniffing protection
- Strict-origin-when-cross-origin referrer behavior
- Disabled camera, geolocation, microphone, payment, and USB browser features

Run the Playwright suite against the production build to verify the complete
policy.

## Optional deployment checks

When a real environment exists, the `Staging validation`, `Deployment smoke
tests`, and `DAST` workflows can be started manually with explicitly supplied
targets. They do not run on pull requests, schedules, or deployment events.
Before enabling them, configure their protected allowed-host variables. For
deployment smoke, set `SMOKE_ALLOWED_APP_HOST`, `SMOKE_ALLOWED_API_HOST`, and
`SMOKE_EXPECTED_DEPLOYMENT_ID`; the expected identifier must match the
immutable `deployment_id` supplied for the run.

All three workflows validate URLs, credentials, canonical hostnames, and
allow-listed targets through `scripts/validate-workflow-targets.mjs`. Smoke
validation additionally requires the requested and expected immutable
deployment identifiers to match; DAST validation explicitly rejects the
configured production hostname.
See [Staging](staging.md) and [Release operations](release-operations.md) before
using them against an authorized environment.
