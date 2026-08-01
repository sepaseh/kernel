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

One approving review is required for every pull request. Code Owner review is
not currently a separate requirement, so any collaborator with review
permission may provide the approval. Enable required Code Owner review when
ownership must be enforced rather than used only for automatic reviewer
suggestions.

GitHub currently permits squash, merge-commit, and rebase merges. Squash merge
is preferred for ordinary changes because the pull-request title then becomes
the single Conventional Commit consumed by Release Please.
