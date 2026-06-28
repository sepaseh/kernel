# Testing

This starter does not currently include a test runner. Do not add one just because a change could be tested.

## Existing checks

Use the configured project checks first:

```bash
npm run typecheck
npm run lint
npm run build
npm run knip
```

## When adding tests later

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
