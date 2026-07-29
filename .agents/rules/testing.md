# Testing

Kernel uses Vitest for unit and integration tests, React Testing Library with
user-event for components, MSW for API mocking, and Playwright for critical
browser journeys.

## Existing checks

Use the configured project checks first:

```bash
npm run typecheck
npm run lint
npm run test:coverage
npm run test:e2e
npm run build
npm run knip
```

## Choosing a test layer

If the project gains a test setup, use this decision tree:

- Pure utility or mapper: unit test.
- Hook that composes state or side effects: integration test.
- Component with user interaction or validation: component test.
- Critical user flow such as login or navigation: end-to-end test.
- Pure presentational component with no logic: usually do not test.

## Test style

- Test user-visible behavior, not internal implementation details.
- Prefer accessible selectors such as labels, roles, and visible text.
- Use small test data factories for repeated domain objects.
- Keep tests isolated and deterministic.
- Mock external APIs; do not depend on production services.
- Use the shared utilities in `src/test` and follow `docs/testing.md`.
