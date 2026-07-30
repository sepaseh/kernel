# Deployment

This repository includes Docker, nginx, and Docker Compose example files for serving the built frontend.

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

## Docker

Build the image:

```bash
docker build -t kernel .
```

Run the image:

```bash
docker run --rm -p 8080:80 kernel
```

## Docker Compose

Use the example compose file as a starting point:

```bash
docker compose -f docker-compose.example.yml up --build
```

Review environment values and service names before using it outside local development.

## nginx

`nginx.conf` serves the static build and supports client-side routing by falling back to `index.html`.

When adding routes in React, no nginx route changes are normally required as long as the fallback remains in place.
