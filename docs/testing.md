# Testing

Kernel uses a layered test strategy. Each tool has one job so the suite stays
fast and maintainable.

## Stack

| Layer           | Tools                                | Use it for                                                   |
| --------------- | ------------------------------------ | ------------------------------------------------------------ |
| Unit            | Vitest                               | Pure functions, hooks, reducers, and isolated logic          |
| Component       | React Testing Library and user-event | User-visible rendering and interactions                      |
| UI development  | Storybook                            | Isolated components, layouts, themes, and responsive states  |
| API integration | MSW                                  | Request serialization, response handling, and error states   |
| Mock runtime    | Node test runner                     | Collection discovery, local auth, CORS, and error simulation |
| End-to-end      | Playwright and axe-core              | Critical journeys and automated accessibility checks         |

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
  **/*.stories.tsx      # Stories colocated with components and layouts
  test/
    render.tsx          # Shared Testing Library render and user-event setup
    setup.ts            # Global cleanup and MSW lifecycle
    mocks/
      handlers.ts       # Stable default API handlers
      server.ts         # One shared Node interception server
e2e/
  *.spec.ts             # Playwright browser journeys
scripts/
  *.test.mjs            # Build-environment and bundle-budget gate tests
server/
  *.test.cjs            # Collection-driven local mock runtime tests
```

Keep tests next to production modules when they describe that module. Put
cross-cutting test infrastructure under `src/test`. Keep Playwright tests
separate because they run against the built application. Tests beside Node
scripts exercise their exported validation logic without requiring a production
deployment or oversized generated artifacts.

Mock-server tests are separate from MSW tests. MSW keeps component and API-client
tests isolated and fast; the Node server tests verify that the executable Bruno
collection can drive a real local HTTP process. Neither layer contacts a
developer-configured or production API.

## Commands

- `npm test` runs Vitest once.
- `npm run test:watch` starts Vitest in watch mode.
- `npm run test:coverage` writes text, HTML, JSON summary, and LCOV reports.
- `npm run test:contract` generates Pact consumer contracts.
- `npm run server:test` verifies the collection-driven local mock API.
- `npm run test:e2e` builds the application and runs Playwright.
- `npm run test:e2e:ui` opens Playwright's interactive UI.
- `npm run test:e2e:report` opens the most recent HTML report.
- `npm run test:e2e:update-snapshots` reviews and updates visual baselines.
- `npm run storybook` starts the component and layout explorer.
- `npm run build-storybook` verifies the static Storybook build used by CI.
- `npm run test:storybook` runs every story in Chromium, including `play`
  interactions and blocking accessibility checks.
- `npm run performance` builds the app and checks bundle-size budgets.
- `npm run lighthouse` runs the local advisory Lighthouse audit after a build.
- `npm run test:mutation`, `test:smoke`, and `test:staging` run specialized
  checks that are scheduled or manually invoked outside the pull-request loop.

Vitest loads the tracked `.env.test` file, which provides deterministic local
API and application base URLs for unit, component, and API integration tests.
These values take precedence over developer-specific `.env.local` settings, so
tests never depend on or contact a configured development backend.

Playwright builds its preview server with a separate deterministic environment
defined in `playwright.config.ts`: the application base is `/`, the release ID
is `e2e`, and the API origin is `http://api.example.com`. Browser tests
intercept that reserved example origin. These explicit values override
developer-specific `.env.local` settings and prevent local E2E runs from
contacting a configured backend.

Pull requests run the critical browser suite in Chromium. Firefox, WebKit,
mobile, and visual projects remain available for focused local checks when a
change warrants broader browser coverage. Install those browsers as needed:

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
- All emitted JavaScript chunks combined may not exceed 1.9 MB.

These limits catch unexpectedly large bundles without pretending that a CI
preview server represents real production performance.

CI also runs a non-blocking Lighthouse audit against the built login page and
uploads its HTML and JSON reports for 14 days. Broad advisory thresholds flag
only substantial regressions: a performance score below 60, FCP above 6s, LCP
above 6.5s, TTI above 7s, TBT above 600ms, or CLS above 0.2. Runner variance may
still affect results, so bundle-size budgets remain the blocking performance
gate. Replace the preview target with a representative deployed URL when one
exists.

`scripts/run-lighthouse.test.mjs` covers authentication-target URL construction,
boundary acceptance, aggregated threshold failures, and missing audit data
without starting Vite or Chrome. Browser dependencies are loaded only by the
direct CLI execution path.

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
- Run axe against public forms, authenticated pages, and open dialogs. Pair
  automated scans with keyboard and focus assertions.
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
Coverage is a guardrail, not a quality score. Critical authentication, token
refresh, authorization, and account-management branches should receive direct
behavioral tests even when the global threshold is already satisfied.

Story files are excluded from unit coverage, matching SonarQube's existing
Storybook exclusions. They are executable test definitions rather than
production modules: `test:coverage` measures application code through the unit
project, while `test:storybook` separately executes stories, interactions, and
accessibility checks in a real browser. This prevents unexecuted story modules
from lowering unit coverage without weakening Storybook validation.

The starter's Storybook and E2E axe configurations disable only the
`color-contrast` rule because the unmodified Ant Design palette has known 14px
contrast failures. All other automated accessibility rules remain blocking,
alongside explicit keyboard and focus tests. A real product must replace the
starter palette with its accessible brand palette and remove this exception
from both suites.

## Test effectiveness and API compatibility

Mutation testing measures whether focused unit tests detect injected faults,
while Pact consumer contracts protect the request and response boundary with
the backend. See [Mutation and contract testing](contract-testing.md) for local
commands, CI behavior, thresholds, and provider verification requirements.

## SonarQube

SonarQube consumes the existing Vitest LCOV report and adds advisory analysis
for new bugs, vulnerabilities, security hotspots, and maintainability issues.
It does not replace ESLint, TypeScript, Vitest, or CodeQL and does not block CI.
See [SonarQube](sonarqube.md) for repository settings and noise controls.
