# Deployment

This repository includes an nginx configuration for serving the built frontend
with client-side routing, long-lived asset caching, and required security
headers.

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
