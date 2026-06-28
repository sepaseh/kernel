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

Vite reads environment variables at build time. Make sure production values are present before building the image or static bundle.

Required values usually include:

```env
VITE_API_BASE_URL=https://api.example.com
VITE_APP_BASE_URL=/
VITE_AUTH_TOKEN_KEY=react_base_auth_token
```

`VITE_APP_BASE_URL` must match the path where the app is served. For example, if the app is hosted under `/app/`, set:

```env
VITE_APP_BASE_URL=/app/
```

## Docker

Build the image:

```bash
docker build -t react-base .
```

Run the image:

```bash
docker run --rm -p 8080:80 react-base
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
