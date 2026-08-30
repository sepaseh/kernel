---
name: review-pr
description: Review a Kernel pull request for actionable defects.
---

# Review a pull request

Read `.agents/rules/git.md`, `.agents/rules/code-review.md`,
`.agents/rules/pull-requests.md`, and `.agents/rules/safety.md`.

1. Confirm the repository and PR. Read its title, body, checks, commits, and complete diff.
2. Inspect relevant implementation, tests, collection entries, and documentation.
3. Evaluate the affected dimensions in `code-review.md`; do not treat CI as a substitute for review.
4. Report actionable findings first, ordered by priority, with tight locations and failure scenarios.
5. Submit a remote review only when the user explicitly authorizes it.
