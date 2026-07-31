# SonarQube Quality Gate

Kernel follows Clean as You Code. The SonarQube project must use a quality gate
that fails when new code violates any of these conditions:

| New-code condition         | Required value |
| -------------------------- | -------------- |
| Issues                     | `0`            |
| Security Hotspots reviewed | `100%`         |
| Coverage                   | `>= 80%`       |
| Duplicated lines           | `<= 3%`        |

These conditions apply to new code only. Existing debt should be improved
incrementally instead of weakening the gate for new changes.

## SonarQube setup

An administrator must:

1. Create a custom quality gate based on `Sonar way`.
2. Require no issues on new code.
3. Keep Security Hotspots reviewed at 100%.
4. Keep new-code coverage at 80% or higher.
5. Keep duplicated lines on new code at 3% or lower.
6. Assign the gate to the Kernel project.
7. Define new code using the previous-version or reference-branch strategy.

The repository disables SonarQube's small-change exception so coverage and
duplication conditions also apply when a change contains fewer than 20 lines.
CI waits for the quality-gate result and fails when the gate fails.

The remote gate cannot be configured from this repository. It requires
SonarQube project-administrator access and all three GitHub Actions settings:
the `SONAR_TOKEN` repository secret plus the `SONAR_PROJECT_KEY` and
`SONAR_HOST_URL` repository variables. CI fails before analysis when any
setting is missing. See [Testing](testing.md#sonarqube) for configuration
details.
