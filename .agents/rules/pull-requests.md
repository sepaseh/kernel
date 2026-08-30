# Pull requests

A pull request explains why a change is needed, what changed, and how to verify
it. Use the repository's pull-request conventions in `CONTRIBUTING.md`.

## Before creation

- Target `main` and review the complete base-to-head diff for unrelated work.
- Run the complete gate in `CONTRIBUTING.md` on the final tree.
- Use a Conventional Commit title; squash merging makes it the release commit.

## Body and linkage

- Explain the problem and chosen approach, not just changed files.
- Use `Closes #123` or `Fixes #123` only when the pull request fully resolves an issue.
- Report only checks actually run and disclose limitations or residual risks.
- Include screenshots or recordings for visible UI changes.
- Keep the pull request as draft while required work or evidence is incomplete.

Do not create, update, mark ready, merge, or close a pull request without
explicit authorization for that remote action.
