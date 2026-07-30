# Development

This project is a Vite React application written in TypeScript.

## Prerequisites

- Node.js 24.15.0 or newer in the Node.js 24 LTS line
- npm
- Access to the backend API

## Setup

Install dependencies:

```bash
npm install
```

Copy the example environment file:

```bash
cp .env.example .env.local
```

Update `.env.local` for your backend:

```env
VITE_API_BASE_URL=https://localhost:8080
VITE_APP_BASE_URL=/
```

Start the app:

```bash
npm run dev
```

Vite is configured with `--host`, so the development server can be reached from the local network when your firewall allows it.

## Quality Checks

Run type checking:

```bash
npm run typecheck
```

Run linting:

```bash
npm run lint
```

Build the app:

```bash
npm run build
```

Production builds require `VITE_API_BASE_URL` and `VITE_APP_BASE_URL` from
`.env.local` or the build environment. See [Deployment](deployment.md) for
their validation rules.

Check unused files, exports, and dependencies:

```bash
npm run knip
```

## Import Style

Use `./` for same-directory imports and `@/` for imports that cross source directories:

```ts
import { apiClient } from "./instance";
import { routeTree } from "@/config";
```

Keep feature code close to the existing structure:

- API calls live in `src/api`.
- Route-level screens live in `src/pages`.
- Shared UI lives in `src/components`.
- Entity forms live in `src/forms`.
- Shared contracts live in `src/types`.

## Localization

The application currently ships with English (`en`) and Persian (`fa`). Translation strings live in `src/locales/en.ts` and `src/locales/fa.ts`.

Ant Design direction and locale are selected in `src/providers/Antd.tsx`. Day.js locale/calendar setup is handled in `src/providers/Core.tsx`, using the Jalali calendar for Persian.
