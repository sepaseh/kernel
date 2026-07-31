# Main Branch Protection

The `main` branch is protected on GitHub. Changes must be merged through a pull
request after the branch is current and these checks pass:

| Required check                               | Coverage                                                |
| -------------------------------------------- | ------------------------------------------------------- |
| `CI / check`                                 | Audit, types, lint, format, tests, contracts, dead code |
| `CI / build`                                 | Validated production build                              |
| `CI / e2e`                                   | Critical browser journeys                               |
| `CodeQL / Analyze JavaScript and TypeScript` | CodeQL security analysis                                |

SonarQube also runs on pull requests as an advisory signal. It is intentionally
not a required check; findings should be reviewed without making service
availability a condition for merging.

Protection also:

- Applies to repository administrators.
- Requires review conversations to be resolved.
- Prevents force-pushes.
- Prevents deletion of `main`.

An approving review is not required for ordinary changes while the repository
has only one active maintainer. Enable at least one approval and Code Owner
review when another maintainer can review pull requests without blocking all
development.
