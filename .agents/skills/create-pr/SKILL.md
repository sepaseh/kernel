---
name: create-pr
description: Prepare or create a focused Kernel pull request.
---

# Create a pull request

Read `.agents/rules/git.md`, `.agents/rules/pull-requests.md`,
`.agents/rules/commits.md`, and `.agents/rules/safety.md`. Use
`validate-change` for the readiness gate.

1. Confirm the repository, head branch, base branch, and whether remote creation is authorized.
2. Review the complete diff and commits against the base branch; exclude unrelated or generated changes.
3. Run the complete gate required by `CONTRIBUTING.md`.
4. Draft a Conventional Commit title and explain the problem, approach, verification, and limitations.
5. Request separate push authorization if the branch is unpublished. Create or mark ready a remote PR only when explicitly authorized.
