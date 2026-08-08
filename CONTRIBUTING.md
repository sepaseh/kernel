# Contributing to Kernel

Thank you for helping improve Kernel. Keep changes focused, tested, and easy to
review.

## Development setup

Kernel uses Node.js 24.15.0 or newer in the Node.js 24 LTS line. If you use
`nvm`, select the exact repository version from `.nvmrc` before installing
dependencies. CI reads the same file:

```bash
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

On Windows, copy `.env.example` to `.env.local` using your preferred file
manager or shell.

## Working on a change

1. Create a branch from the latest `main`.
2. Keep each pull request limited to one coherent change.
3. Add or update tests for behavior changes.
4. Do not commit secrets, local environment files, generated reports, or build
   output.
5. Update documentation when behavior, configuration, or public APIs change.

Use Conventional Commits such as `feat:`, `fix:`, `test:`, `docs:`, and
`chore:`. These messages drive semantic versioning and automated release notes,
so pull request titles must also follow the format when squash merging. See
[docs/releasing.md](docs/releasing.md) for the versioning and release policy.

## Required checks

Run the same complete checks used by continuous integration before every
commit; do not create the commit unless all of them pass:

```bash
npm run typecheck
npm run audit
npm run lint
npm run format:check
npm run test:coverage
npm run test:contract
npm run knip
npm run performance
npm run build-storybook
npm run test:storybook
npm run test:e2e -- --project=chromium
```

Use `npm run format` and `npm run lint:fix` to apply safe automatic fixes.

## Pull requests

A pull request should:

- Explain the problem and the chosen solution.
- Link related issues when applicable.
- Describe testing performed and any known limitations.
- Include screenshots or recordings for visible interface changes.
- Pass all required checks.
- Avoid unrelated formatting or refactoring.

At least one code-owner review is expected before merging. Security
vulnerabilities must follow [SECURITY.md](SECURITY.md) instead of being
disclosed in a public issue.
