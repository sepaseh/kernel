# Current quality attributes and gates

This document records measurable constraints already encoded in Kernel. It does
not define production availability, capacity, latency, retention, recovery, or
compliance commitments.

## Compatibility and build

- Node.js must satisfy `>=24.15.0 <25`; CI uses the exact `.nvmrc` version.
- TypeScript, ESLint, Prettier, dependency audit, and Knip are blocking checks.
- Production builds validate required environment values before compiling.
- Route pages are lazy-loaded and Vite splits React, UI, and vendor chunks.

## Test and coverage gates

| Metric     | Current global minimum |
| ---------- | ---------------------- |
| Statements | 68%                    |
| Branches   | 54%                    |
| Functions  | 59%                    |
| Lines      | 69%                    |

Pull-request CI also blocks on contract tests, Storybook browser tests, the
collection-driven mock-server tests, production and static Storybook builds,
and the Chromium end-to-end suite.

## Accessibility

- Storybook executes automated accessibility checks in Chromium.
- Playwright covers public forms, authenticated management, keyboard focus, and
  dialog behavior.
- Icon-only controls require accessible names, and status must not rely on color
  alone.
- The automated `color-contrast` rule is currently excluded for documented Ant
  Design starter-palette debt; all other configured accessibility rules block.

## Security and privacy controls

- Access tokens remain in memory and refresh credentials remain HttpOnly.
- A protected request receives at most one refresh and retry cycle.
- Production preview and nginx apply CSP, frame denial, MIME protection,
  referrer policy, and a restrictive permissions policy.
- Workflow targets require valid URLs and allow-listed non-production hosts.
- Dependency auditing blocks high-severity findings.
- Observability redacts credential-like fields and URL query values.

## Performance gates and advisories

The blocking bundle budget limits each JavaScript chunk to 450,000 bytes and
total JavaScript output to 1,900,000 bytes.

Lighthouse runs against the built authentication page as a non-blocking CI
advisory with these broad regression thresholds:

| Signal                   | Advisory threshold       |
| ------------------------ | ------------------------ |
| Performance score        | Minimum 60               |
| First Contentful Paint   | Maximum 6 seconds        |
| Largest Contentful Paint | Maximum 6.5 seconds      |
| Time to Interactive      | Maximum 7 seconds        |
| Total Blocking Time      | Maximum 600 milliseconds |
| Cumulative Layout Shift  | Maximum 0.2              |

These values detect major regressions on shared runners; they are not production
service-level objectives.
