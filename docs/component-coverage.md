# Production file coverage

Every production module requires dedicated behavioral coverage by default, and
every visual component requires Storybook coverage. Coverage may be omitted only
for one of the explicit exception groups below.

## Default coverage

- Test the observable contract of every production module.
- Add stories for the meaningful states of every visual component.
- Route pages and forms may use the shared integration suites when those suites
  name and exercise their behavior directly.
- Incidental rendering as a child of another test is not dedicated coverage.
- API tests complement component tests; they do not replace UI behavior coverage.

## Explicit exceptions

Dedicated tests or stories may be omitted for:

- entry points that only mount the application;
- pure composition modules with no branch, mapping, fallback, state, or visible UI;
- provider adapters whose observable behavior is already covered by provider tests;
- generated or static visual assets with no meaningful variants;
- test harnesses and Storybook decorators;
- non-visual modules, which do not require stories but still require tests unless
  another exception applies.

Difficulty mocking a module, incidental coverage, or a passing global coverage
threshold is not an exception.

## Current Kernel coverage map

- Routing and route access are covered by `src/app/Routes.test.tsx` and the pure
  access-policy tests under `src/app/lib`.
- Account, authentication, role, and user pages and forms use the named
  integration suites under `src/test/integration` plus colocated API tests.
- Shared interactive UI primitives have colocated tests and stories.
- Core, Ant Design, and layout providers have focused observable-behavior tests.
- `App.tsx`, `main.tsx`, re-export-only `index.ts` files, and test harnesses are
  composition exceptions.
- The empty dashboard is starter scaffolding with no behavior or meaningful
  visual state. Add tests and a story when it gains either.
- The shared icon wrapper has Storybook coverage but no focused unit test; add
  one when its mapping, fallback, accessibility, or prop behavior changes.

New visual components should ship with both behavioral tests and stories unless
an exception is explicit and evident in the implementation.
