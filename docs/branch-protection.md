# Main Branch Protection

The `main` branch is protected on GitHub. Changes must be merged through a pull
request after the branch is current and these checks pass:

| Required check                      | Coverage                                                |
| ----------------------------------- | ------------------------------------------------------- |
| `check`                             | Audit, types, lint, format, tests, SonarQube, dead code |
| `build`                             | Validated production build                              |
| `e2e`                               | Critical browser journeys                               |
| `Analyze JavaScript and TypeScript` | CodeQL security analysis                                |

Protection also:

- Applies to repository administrators.
- Requires review conversations to be resolved.
- Prevents force-pushes.
- Prevents deletion of `main`.

An approving review is not required while the repository has only one active
maintainer. Enable at least one approval and Code Owner review when another
maintainer can review pull requests without blocking all development.

The SonarQube scan is part of the required `check` job. Configure the repository
settings described in [Testing](testing.md#sonarqube) before treating the
quality gate as active.
