# Documentation map

This page maps every maintained project area to its source of truth. A change
that introduces a new subsystem, workflow, environment variable, or public
contract must add or update an entry here.

## Start here

- New checkout: [Development](development.md), then [Troubleshooting](troubleshooting.md).
- Understand the system: [Architecture](architecture.md), [Database schema and ERD](database-schema.md), and [Runtime sequences](sequences.md).
- Extend the starter: [Feature development](feature-development.md) and [Localization](localization.md).
- Validate a change: [Testing](testing.md) and [Contributing](../CONTRIBUTING.md).
- Operate a deployment: [Deployment](deployment.md), [Backup and restore](backup-restore.md), and [Release operations](release-operations.md).

## Evidence and source-of-truth rules

Documentation explains the system but does not override executable contracts or
implementation. When sources disagree:

1. The Bruno collection defines observable HTTP behavior.
2. TypeScript types and feature API modules define the frontend integration boundary.
3. Runtime code defines current UI behavior and state ownership.
4. Narrative documents summarize those sources and must change with them.

Do not present planned behavior as implemented. Update the collection before
changing an observable external contract.

Mermaid diagrams stay inside Markdown so reviews include changes to both the
diagram and its explanation. Update ERD keys/cardinality with schema changes and
sequence success/failure paths with runtime changes. Operational procedures are
instructions for a downstream service, not evidence that the template has an
active deployment or automated backups.

For sequence diagrams, keep numbered steps, preconditions, outcomes, and
failure/cleanup paths together. Show transaction boundaries and shared requests
where concurrency matters, and link the owning code and existing tests. Use
phase labels for longer flows without implying those phases are atomic.

| Area                                                                                   | Primary documentation                                                                                                    | Implementation and configuration                                                                                                            |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Setup, scripts, and local development                                                  | [Development](development.md)                                                                                            | `package.json`, `.nvmrc`, `.env.example`, Vite and TypeScript configs                                                                       |
| Executable HTTP collection and frontend integration                                    | [Collection guide](collection-guide.md)                                                                                  | `collection`, feature API/types modules, contract tests                                                                                     |
| Standalone API, persistence, authentication, and object storage                        | [Backend guide](../server/README.md), [Database schema](database-schema.md), and [Collection guide](collection-guide.md) | `server/src`, `server/drizzle`, `drizzle.config.ts`, `compose.yaml`                                                                         |
| Backend logging, request correlation, redaction, and process lifecycle                 | [Backend logging](backend-logging.md)                                                                                    | `server/src/logger.ts`, `log-sanitization.ts`, `request-logging.ts`, `lifecycle.ts`, auth/file routes, browser API client and observability |
| Application structure and boundaries                                                   | [Architecture](architecture.md)                                                                                          | `src/app`, `src/features`, `src/layouts`, `src/shared`, `eslint.config.ts`                                                                  |
| Routes, permissions, localization, theme, fonts, and storage                           | [Architecture](architecture.md)                                                                                          | `src/app`, `src/shared/config`, `src/shared/i18n`, `src/shared/storage`, `src/assets`                                                       |
| Production-file test and Storybook expectations                                        | [Component coverage](component-coverage.md)                                                                              | `src`, unit and integration tests, stories, Storybook                                                                                       |
| Implemented compatibility, coverage, accessibility, security, and performance gates    | [Quality attributes](quality-attributes.md)                                                                              | Engines, Vitest, CI, Playwright, Lighthouse, security and bundle configuration                                                              |
| HTTP, authentication, token refresh, and endpoint contracts                            | [API client](api-client.md)                                                                                              | `src/shared/api`, feature `api.ts` and `types.ts` files                                                                                     |
| Unit, component, integration, browser, accessibility, visual, and Storybook testing    | [Testing](testing.md)                                                                                                    | Vitest, Playwright, `.storybook`, `e2e`, and `src/test`                                                                                     |
| Consumer contracts and mutation testing                                                | [Mutation and contract testing](contract-testing.md)                                                                     | `contract`, `vitest.contract.config.ts`, `stryker.config.json`                                                                              |
| Build, environment validation, nginx, security headers, observability, and performance | [Deployment](deployment.md)                                                                                              | `vite.config.ts`, `nginx.conf`, `scripts`, `smoke`                                                                                          |
| Staging validation                                                                     | [Staging](staging.md)                                                                                                    | `staging`, `staging.config.ts`, staging workflow                                                                                            |
| CI checks and merge policy                                                             | [Branch protection](branch-protection.md)                                                                                | CI and CodeQL workflows, `CODEOWNERS`, GitHub branch settings                                                                               |
| Versioning and release automation                                                      | [Versioning and releases](releasing.md)                                                                                  | Release workflow, Release Please config, changelog and manifest                                                                             |
| Production approval, promotion, rollback, and incident follow-up template              | [Release operations](release-operations.md)                                                                              | Deployment-smoke workflow and downstream environment controls                                                                               |
| Static analysis                                                                        | [SonarQube](sonarqube.md)                                                                                                | `sonar-project.properties` and advisory CI scan                                                                                             |
| Security policy and assurance                                                          | [Security policy](../SECURITY.md) and `security/` reviews                                                                | CodeQL and authorized DAST workflows, threat model                                                                                          |
| AI assistant rules and safety hooks                                                    | [AI guidance](../.agents/README.md)                                                                                      | `AGENTS.md`, `.agents/settings.json`, `.agents/rules`, `.agents/hooks`                                                                      |

## Practical guides and diagram ownership

| Area                                                                                       | Primary documentation                         | Implementation and configuration                                                                                      |
| ------------------------------------------------------------------------------------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Adding features, routes, navigation, and permissions                                       | [Feature development](feature-development.md) | `collection`, `src/features`, `src/app/config/routes.ts`, `src/app/Routes.tsx`, `server/src/domain.ts`, server routes |
| Language resources, RTL, global language selection, and calendar conversion                | [Localization](localization.md)               | `src/shared/config/language.ts`, frontend/backend i18n, core/Ant Design providers, server settings routes             |
| Authentication, email verification, file transfer, and administrator concurrency sequences | [Runtime sequences](sequences.md)             | Auth/account features, shared API client, Hono auth/account/user/file routes, Better Auth, storage adapters           |
| Startup, CORS, login, data, and storage troubleshooting                                    | [Troubleshooting](troubleshooting.md)         | Server config/startup, Vite, shared API client, migrations, storage                                                   |
| Consistent database/object backup and restore rehearsal                                    | [Backup and restore](backup-restore.md)       | Database URL, storage paths/buckets, migrations, startup lifecycle, downstream backup tooling                         |

Generated output directories such as `dist`, `coverage`, `pacts`, Storybook,
Lighthouse, mutation, and Playwright reports are intentionally excluded from
version control. Their producers and retention behavior are documented in the
testing, contract-testing, deployment, and workflow documents above.
