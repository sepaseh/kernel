# Testing

Kernel uses a layered test strategy. Each tool has one job so the suite stays
fast and maintainable.

## Stack

| Layer           | Tools                                | Use it for                                                 |
| --------------- | ------------------------------------ | ---------------------------------------------------------- |
| Unit            | Vitest                               | Pure functions, hooks, reducers, and isolated logic        |
| Component       | React Testing Library and user-event | User-visible rendering and interactions                    |
| API integration | MSW                                  | Request serialization, response handling, and error states |
| End-to-end      | Playwright and axe-core              | Critical journeys and automated accessibility checks       |

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
- `npm run test:e2e:update-snapshots` reviews and updates visual baselines.
- `npm run performance` builds the app, checks bundle budgets, and runs
  Lighthouse.

Vitest loads the tracked `.env.test` file, which provides deterministic local
API and application base URLs for unit, component, and API integration tests.
These values take precedence over developer-specific `.env.local` settings, so
tests never depend on or contact a configured development backend.

Local Chromium and mobile E2E runs use the installed stable Chrome channel.
Firefox and WebKit use Playwright's pinned browser builds. GitHub CI installs
all three pinned engines for reproducibility. Install the required local
browsers once with:

```sh
npx playwright install firefox webkit
```

Visual regression tests run in a dedicated Chromium project with stable mocked
API responses. As with the functional Chromium project, local runs use stable
Chrome and CI uses the pinned Playwright build. Review every changed image
before accepting a baseline update. Generated diffs and actual screenshots
remain available in `test-results/` when a comparison fails.

## Performance budgets

The production build enforces two JavaScript size limits:

- No individual JavaScript chunk may exceed 450 KB.
- All emitted JavaScript chunks combined may not exceed 1.6 MB.

Lighthouse audits the production login page and requires a performance score of
at least 80, first contentful paint within 3.5 seconds, largest contentful paint
within 4 seconds, time to interactive within 4 seconds, total blocking time
below 300 milliseconds, and cumulative layout shift no greater than 0.1.
Reports are written to `.lighthouseci/` and uploaded by CI for 14 days,
including when the performance job fails.

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
- Run axe against public forms, authenticated pages, and open dialogs. Keep
  color-contrast checks enabled and pair automated scans with keyboard and
  focus assertions.
- Run critical browser journeys in English/LTR and Persian/RTL, asserting the
  document language and direction as well as translated controls.
- Keep visual snapshots deterministic: use fixed test data, wait for visible
  page content, and disable animations and carets during capture.
- Add E2E tests only for high-value journeys. Cover permutations and error
  states lower in the test pyramid.

## Coverage

Coverage uses Vitest's V8 provider and includes untested source files. Reports
are written to `coverage/`, which is ignored by Git. Global thresholds preserve
the established baseline across statements, branches, functions, and lines.
Raise thresholds as coverage grows; never lower them to make a change pass.
SonarQube reports a recommended target of at least 80% coverage on new code. Its
quality gate is advisory and does not block CI.

Coverage is a guardrail, not a quality score. Critical authentication, token
refresh, authorization, and account-management branches should receive direct
behavioral tests even when the global threshold is already satisfied.

## Test effectiveness and API compatibility

Mutation testing measures whether focused unit tests detect injected faults,
while Pact consumer contracts protect the request and response boundary with
the backend. See [Mutation and contract testing](contract-testing.md) for local
commands, CI behavior, thresholds, and provider verification requirements.

## SonarQube

CI sends the existing LCOV report to SonarQube and requires all of these GitHub
repository settings:

| Setting             | GitHub type         | Value                                       |
| ------------------- | ------------------- | ------------------------------------------- |
| `SONAR_HOST_URL`    | Repository variable | Base URL of the SonarQube service           |
| `SONAR_PROJECT_KEY` | Repository variable | Key of the Kernel project in SonarQube      |
| `SONAR_TOKEN`       | Repository secret   | Project analysis token created in SonarQube |

Configure them under **Settings → Secrets and variables → Actions**. Store the
token as a secret, never as a variable or committed file. CI reports the names
of missing settings before analysis starts and continues the remaining checks;
it never prints their values.

The scan publishes findings without waiting for the configured quality gate.
Scanner or gate failures are reported as errors but do not block CI. See
[SonarQube Analysis](quality-gate.md) for the recommended new-code targets and
project setup.
