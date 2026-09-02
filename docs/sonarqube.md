# SonarQube

CI runs SonarQube as an advisory check after Vitest produces the LCOV coverage
report. Scanner failures do not block the remaining checks or merging. Runs
without the required repository settings are skipped with a notice.

Configure `SONAR_HOST_URL` and `SONAR_PROJECT_KEY` as repository variables and
`SONAR_TOKEN` as a repository secret.

To keep pull-request feedback focused, configure SonarQube in its project UI:

- Apply the quality gate to new code rather than existing project debt.
- Keep bugs, vulnerabilities, and security hotspots visible.
- Disable stylistic TypeScript rules already enforced by ESLint or the compiler.
- Add rule or file exclusions only for a reviewed, documented false positive.

Analysis scope and LCOV import stay versioned in `sonar-project.properties`.
Quality Profile configuration and broadly applicable rule changes belong in the
SonarQube UI so maintainers can review them centrally. Narrow, reviewed
exclusions that are specific to this codebase may remain versioned in
`sonar-project.properties`, with their rationale documented here.

Resolve findings according to the repository's
[code-quality guidance](../.agents/rules/code-quality.md). Do not add wrappers,
adapters, `bind` calls, or other indirection solely to satisfy a rule. Prefer an
idiomatic design improvement; when a finding is a verified false positive,
document and narrowly suppress it instead of degrading the implementation.

The versioned `typescript:S6544` TSX exclusion covers React and Ant Design event
contracts that intentionally type callbacks as returning `void` while allowing
fully handled asynchronous implementations. It does not apply to non-TSX
application code.
