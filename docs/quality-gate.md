# SonarQube Analysis

Kernel uses SonarQube as an advisory code-quality signal. Analysis findings are
visible in SonarQube and pull requests, but the repository CI does not fail when
the scanner is unavailable or the quality gate is not satisfied.

The recommended project quality gate uses these new-code targets:

| New-code condition         | Required value |
| -------------------------- | -------------- |
| Issues                     | `0`            |
| Security Hotspots reviewed | `100%`         |
| Coverage                   | `>= 80%`       |
| Duplicated lines           | `<= 3%`        |

These targets apply to new code only. They guide incremental improvement without
blocking structural refactors or small maintenance changes.

## SonarQube setup

An administrator must:

1. Create a custom quality gate based on `Sonar way`.
2. Use the recommended targets above as project guidance.
3. Keep security findings visible and assign critical findings for remediation.
4. Assign the gate to the Kernel project.
5. Define new code using the previous-version or reference-branch strategy.

The repository keeps SonarQube's small-change exception enabled and does not wait
for the quality-gate result. The CI scan is non-blocking, so analysis remains
available without making SonarQube an availability dependency for pull requests.

The remote gate cannot be configured from this repository. It requires
SonarQube project-administrator access and all three GitHub Actions settings:
the `SONAR_TOKEN` repository secret plus the `SONAR_PROJECT_KEY` and
`SONAR_HOST_URL` repository variables. CI reports missing configuration without
blocking the remaining checks. See [Testing](testing.md#sonarqube) for
configuration details. If a separate SonarQube or SonarCloud status check is
required by branch protection, that check must also be made optional in the
GitHub repository settings.
