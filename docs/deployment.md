# Deployment

This repository includes an nginx configuration for serving the built frontend
with client-side routing, long-lived asset caching, and required security
headers.

Release candidates must pass the production-like
[staging environment](staging.md) before production promotion.

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
VITE_API_BASE_URL=https://api.example.com
VITE_APP_BASE_URL=/
```

`VITE_APP_BASE_URL` must match the path where the app is served. For example, if the app is hosted under `/app/`, set:

```env
VITE_APP_BASE_URL=/app/
```

`VITE_API_BASE_URL` must be an absolute HTTPS URL. `VITE_APP_BASE_URL` must
start and end with `/`; use `/` when the application is served at the domain
root.

## Observability

Set `VITE_RELEASE_ID` to an immutable deployment identifier, such as the Git
commit SHA. This release is included with every error and performance event.

To deliver events, set `VITE_OBSERVABILITY_URL` to an HTTPS endpoint that
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
  HTTPS API connections
- HTTP Strict Transport Security for one year, including subdomains
- Denial of framing through CSP and `X-Frame-Options`
- MIME sniffing protection
- Strict-origin referrer behavior
- Disabled camera, geolocation, microphone, payment, and USB browser features

HSTS is honored by browsers only over HTTPS. When TLS terminates at a CDN or
load balancer, configure that edge to preserve these response headers. Run the
Playwright suite against the production build to verify the complete policy.

## Post-deployment smoke tests

The deployment smoke workflow runs after a successful GitHub deployment status
or can be started manually. It checks that:

- The deployed HTML and application root load.
- Same-origin scripts, stylesheets, and fonts resolve successfully.
- Direct navigation to `/auth/register` reaches the client-side route.
- The configured public API health endpoint returns a successful status.

Set the repository variable `SMOKE_API_HEALTH_URL` to the public HTTPS health
endpoint used by automatic deployment runs. The deployment provider must
include its application URL in the successful deployment status. For a manual
run, provide both URLs as workflow inputs.

To run the same checks locally against a deployed environment:

```bash
SMOKE_BASE_URL=https://app.example.com/ \
SMOKE_API_HEALTH_URL=https://api.example.com/health \
npm run test:smoke
```

## Release control and rollback

Production deployments must use the immutable artifact associated with the
approved GitHub Release. Keep at least the current and previous production
artifacts available so recovery does not require rebuilding old source.

Follow the [release operations runbook](release-operations.md) for approval
evidence, observation windows, rollback triggers, recovery steps, and incident
follow-up.
