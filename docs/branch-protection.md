# Main Branch Protection

The `main` branch is protected on GitHub. Changes must be merged through a pull
request after the branch is current and these checks pass:

| Required check                               | Coverage                                                |
| -------------------------------------------- | ------------------------------------------------------- |
| `CI / check`                                 | Audit, types, lint, format, tests, SonarQube, dead code |
| `CI / build`                                 | Validated production build                              |
| `CI / e2e`                                   | Critical browser journeys                               |
| `CodeQL / Analyze JavaScript and TypeScript` | CodeQL security analysis                                |

Protection also:

- Applies to repository administrators.
- Requires review conversations to be resolved.
- Prevents force-pushes.
- Prevents deletion of `main`.

An approving review is not required for ordinary changes while the repository
has only one active maintainer. Release pull requests follow the explicit
approval process in the
[release operations runbook](release-operations.md). Enable at least one
approval and Code Owner review when another maintainer can review pull requests
without blocking all development.

Configure the GitHub `production` environment separately with required
reviewers. Production deployment jobs must reference that environment so its
approval gate applies after merge and before deployment.

The SonarQube scan is part of the required `check` job. Configure the repository
settings described in [Testing](testing.md#sonarqube) before treating the
quality gate as active.
