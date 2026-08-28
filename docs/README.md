# Documentation map

This page maps every maintained project area to its source of truth. A change
that introduces a new subsystem, workflow, environment variable, or public
contract must add or update an entry here.

## Evidence and source-of-truth rules

Documentation explains the system but does not override executable contracts or
implementation. When sources disagree:

1. The Bruno collection defines observable HTTP behavior.
2. TypeScript types and feature API modules define the frontend integration boundary.
3. Runtime code defines current UI behavior and state ownership.
4. Narrative documents summarize those sources and must change with them.

Do not present planned behavior as implemented. Update the collection before
changing an observable external contract.

| Area                                                                                   | Primary documentation                                                                | Implementation and configuration                                                      |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Setup, scripts, and local development                                                  | [Development](development.md)                                                        | `package.json`, `.nvmrc`, `.env.example`, Vite and TypeScript configs                 |
| Executable HTTP collection and frontend integration                                    | [Collection guide](collection-guide.md)                                              | `collection`, feature API/types modules, contract tests                               |
| Local collection-driven mock API                                                       | [Mock server guide](../server/README.md) and [Collection guide](collection-guide.md) | `server`, `collection`, root `server:*` scripts                                       |
| Application structure and boundaries                                                   | [Architecture](architecture.md)                                                      | `src/app`, `src/features`, `src/layouts`, `src/shared`, `eslint.config.ts`            |
| Routes, permissions, localization, theme, fonts, and storage                           | [Architecture](architecture.md)                                                      | `src/app`, `src/shared/config`, `src/shared/i18n`, `src/shared/storage`, `src/assets` |
| Production-file test and Storybook expectations                                        | [Component coverage](component-coverage.md)                                          | `src`, unit and integration tests, stories, Storybook                                 |
| Implemented compatibility, coverage, accessibility, security, and performance gates    | [Quality attributes](quality-attributes.md)                                          | Engines, Vitest, CI, Playwright, Lighthouse, security and bundle configuration        |
| HTTP, authentication, token refresh, and endpoint contracts                            | [API client](api-client.md)                                                          | `src/shared/api`, feature `api.ts` and `types.ts` files                               |
| Unit, component, integration, browser, accessibility, visual, and Storybook testing    | [Testing](testing.md)                                                                | Vitest, Playwright, `.storybook`, `e2e`, and `src/test`                               |
| Consumer contracts and mutation testing                                                | [Mutation and contract testing](contract-testing.md)                                 | `contract`, `vitest.contract.config.ts`, `stryker.config.json`                        |
| Build, environment validation, nginx, security headers, observability, and performance | [Deployment](deployment.md)                                                          | `vite.config.ts`, `nginx.conf`, `scripts`, `smoke`                                    |
| Staging validation                                                                     | [Staging](staging.md)                                                                | `staging`, `staging.config.ts`, staging workflow                                      |
| CI checks and merge policy                                                             | [Branch protection](branch-protection.md)                                            | CI and CodeQL workflows, `CODEOWNERS`, GitHub branch settings                         |
| Versioning and release automation                                                      | [Versioning and releases](releasing.md)                                              | Release workflow, Release Please config, changelog and manifest                       |
| Production approval, promotion, rollback, and incident follow-up template              | [Release operations](release-operations.md)                                          | Deployment-smoke workflow and downstream environment controls                         |
| Static analysis                                                                        | [SonarQube](sonarqube.md)                                                            | `sonar-project.properties` and advisory CI scan                                       |
| Security policy and assurance                                                          | [Security policy](../SECURITY.md) and `security/` reviews                            | CodeQL and authorized DAST workflows, threat model                                    |
| AI assistant rules and safety hooks                                                    | [AI guidance](../.agents/README.md)                                                  | `AGENTS.md`, `.agents/settings.json`, `.agents/rules`, `.agents/hooks`                |

Generated output directories such as `dist`, `coverage`, `pacts`, Storybook,
Lighthouse, mutation, and Playwright reports are intentionally excluded from
version control. Their producers and retention behavior are documented in the
testing, contract-testing, deployment, and workflow documents above.
