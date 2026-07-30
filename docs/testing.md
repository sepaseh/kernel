# Testing

Kernel uses a layered test strategy. Each tool has one job so the suite stays
fast and maintainable.

## Stack

| Layer           | Tools                                | Use it for                                                 |
| --------------- | ------------------------------------ | ---------------------------------------------------------- |
| Unit            | Vitest                               | Pure functions, hooks, reducers, and isolated logic        |
| Component       | React Testing Library and user-event | User-visible rendering and interactions                    |
| API integration | MSW                                  | Request serialization, response handling, and error states |
| End-to-end      | Playwright                           | A small set of critical journeys in a real browser         |

Vitest is the best unit runner for this project because it shares Vite's
TypeScript and module resolution model. React Testing Library encourages tests
against accessible behavior instead of component internals. MSW intercepts
actual network requests, which exercises the API client more realistically than
mocking Axios methods. Playwright is reserved for browser-level confidence,
where DOM emulation is insufficient.

Jest and Cypress are not included. Adding either would duplicate an existing
runner and increase configuration, dependency, and CI cost without filling a
missing testing layer.

## Structure

```text
src/
  **/*.test.ts(x)       # Unit, component, and API integration tests
  test/
    render.tsx          # Shared Testing Library render and user-event setup
    setup.ts            # Global cleanup and MSW lifecycle
    mocks/
      handlers.ts       # Stable default API handlers
      server.ts         # One shared Node interception server
e2e/
  *.spec.ts             # Playwright browser journeys
```

Keep tests next to production modules when they describe that module. Put
cross-cutting test infrastructure under `src/test`. Keep Playwright tests
separate because they run against the built application.

## Commands

- `npm test` runs Vitest once.
- `npm run test:watch` starts Vitest in watch mode.
- `npm run test:coverage` writes text, HTML, JSON summary, and LCOV reports.
- `npm run test:e2e` builds the application and runs Playwright.
- `npm run test:e2e:ui` opens Playwright's interactive UI.
- `npm run test:e2e:report` opens the most recent HTML report.

Local E2E runs use the installed stable Chrome channel. GitHub CI installs and
uses Playwright's pinned Chromium build for reproducibility. If you change the
local project configuration to use bundled Chromium, install it once with:

```sh
npx playwright install chromium
```

## Conventions

- Test behavior users can observe; avoid component state and implementation
  details.
- Prefer queries by role, label, and visible name. Use test IDs only when there
  is no accessible contract.
- Start each interaction test with `userEvent.setup()`; the shared `render`
  helper already returns a `user` instance.
- Use `findBy*` queries or `waitFor` for asynchronous UI. Do not add arbitrary
  sleeps.
- Put reusable successful API behavior in `handlers.ts`. Override exceptional
  behavior per test with `server.use(...)`.
- Unhandled requests fail Vitest. This prevents tests from silently reaching
  real services.
- Keep every test isolated. MSW handlers, mocks, and rendered DOM are reset
  automatically after each test.
- Use Playwright locators and web-first assertions. Do not select by CSS class
  or XPath.
- Add E2E tests only for high-value journeys. Cover permutations and error
  states lower in the test pyramid.

## Coverage

Coverage uses Vitest's V8 provider and includes untested source files. Reports
are written to `coverage/`, which is ignored by Git. The initial global
threshold is intentionally low because Kernel is introducing coverage to an
existing codebase. Raise thresholds as coverage grows; never lower them to make
a change pass.

Coverage is a guardrail, not a quality score. Critical authentication, token
refresh, authorization, and account-management branches should receive direct
behavioral tests even when the global threshold is already satisfied.

## SonarQube

CI sends the existing LCOV report to SonarQube when the repository has a
`SONAR_TOKEN` secret and `SONAR_PROJECT_KEY` variable. Set `SONAR_HOST_URL` as a
repository variable when using SonarQube Server; SonarQube Cloud uses its
default service URL. The scan waits for the configured quality gate, so a
failed gate fails CI. See [SonarQube Quality Gate](quality-gate.md) for the
required new-code conditions and project setup.
