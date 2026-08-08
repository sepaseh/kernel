# AI Guidance

This folder contains provider-neutral guidance for AI coding assistants working on `kernel`.

The repository-root `AGENTS.md` is the discovery entry point. This directory
contains the detailed, provider-neutral rules and optional hook implementations.

## How to use these files

- Read `rules/*.md` before editing matching areas of the codebase.
- Treat `settings.json` as shared project guidance, not as a vendor-specific runtime config.
- Keep local or personal tool permissions out of the repository.
- Prefer repo scripts over ad-hoc commands when validating changes.
- Use the optional scripts in `hooks/` only if your AI tool supports project hooks.

## Core checks

Run the smallest useful check first while developing. Before every commit, run
the complete local CI suite listed in [the Git workflow rule](rules/git.md);
do not create a commit until every required check passes.

```bash
npm run typecheck
npm run lint
npm run build
npm run knip
```

## Current project shape

This is a React 19 + TypeScript + Vite starter kit using Ant Design, Axios, React Router, i18next, Day.js/Jalaliday, ESLint, and Knip.
