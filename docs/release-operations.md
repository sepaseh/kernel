# Release approval and rollback

This runbook governs production releases of Kernel. It complements the
[versioning policy](releasing.md) and the
[deployment guide](deployment.md).

## Ownership

| Role                | Owner                                | Responsibility                                                          |
| ------------------- | ------------------------------------ | ----------------------------------------------------------------------- |
| Release manager     | `@sepaseh`                           | Reviews the release scope, records approval, and coordinates deployment |
| Deployment operator | Production environment administrator | Deploys the approved immutable artifact and performs rollback           |
| Incident lead       | On-call maintainer                   | Decides whether to halt or roll back and coordinates recovery           |

The release manager and deployment operator may be the same person while the
team has one maintainer. With two or more active maintainers, the release pull
request and production deployment should be approved by someone other than the
change author.

Repository ownership is enforced for release configuration and version files
through `CODEOWNERS`. Configure the GitHub `production` environment with required
reviewers and prevent administrators from bypassing its protection rules.

## Release approval

The Release Please pull request is the release candidate. Before approving it,
the release manager must verify:

- The version matches the intended SemVer impact.
- The changelog is complete, understandable, and contains no sensitive data.
- CI `check`, `build`, and `e2e` jobs pass for the exact candidate commit.
- CodeQL and the configured SonarQube quality gate pass.
- Dependency audit, performance budgets, and production security-header tests
  pass.
- Required configuration or data migrations have a tested rollback path.
- The previous production artifact and its configuration remain available.
- A deployment operator and incident lead are available for the release window.

Approval is recorded by approving and merging the release pull request. Never
publish a tag or deploy from an unreviewed commit. The generated GitHub Release,
tag, built artifact, and deployment must all identify the same commit.

## Deployment verification

After deployment:

1. Record the version, commit SHA, artifact identifier, operator, and start time
   in the deployment record.
2. Run the automated deployment smoke tests.
3. Verify login, protected routing, and one read-only authenticated journey.
4. Confirm security headers and API health checks succeed.
5. Compare error rate, failed requests, latency, largest contentful paint,
   layout shift, and long tasks with the previous release.
6. Announce success only after the observation window completes.

Use a minimum 15-minute observation window for routine changes. Extend it for
authentication, authorization, configuration, infrastructure, or major-version
changes.

## Rollback triggers

The incident lead should halt rollout or begin rollback when any of these occur:

- Smoke tests or API health checks fail.
- Users cannot authenticate, authorize, navigate, or complete a critical flow.
- Error rate, failed requests, or latency materially regress from the previous
  release.
- Security controls are missing or a new vulnerability or data-exposure risk is
  discovered.
- Assets fail to load, client routing breaks, or the deployment configuration
  is invalid.
- A migration is incomplete or incompatible with the running frontend.

When impact is uncertain, prefer stopping further rollout while evidence is
collected. Do not attempt an unrelated forward fix during an active rollback.

## Rollback procedure

1. Declare the release unhealthy, assign the incident lead, and pause further
   deployments.
2. Capture the failing version, commit SHA, timestamps, symptoms, dashboards,
   logs, and smoke-test artifacts.
3. Select the last known-good immutable artifact. Verify its checksum, release
   identifier, configuration compatibility, and API compatibility.
4. Promote that artifact using the hosting provider's rollback or deployment
   mechanism. Do not rebuild the old source because dependencies and output may
   have changed.
5. Restore the matching environment configuration. Run only a separately tested
   backward migration when data or schema changes require it.
6. Purge or invalidate cached HTML when necessary; fingerprinted static assets
   may remain cached.
7. Re-run deployment smoke tests, critical authentication checks, API health
   checks, and security-header verification.
8. Observe production until the rollback version returns to its prior baseline.
9. Record the recovery time and announce restoration. Keep the failed Git tag
   and GitHub Release for traceability; mark them as withdrawn instead of
   deleting or moving tags.

If rollback cannot safely restore service, keep the rollout halted, activate
the service's incident-response process, and make the smallest reviewed forward
fix from the last known-good version.

## Follow-up

Within two business days, document the cause, customer impact, detection gap,
timeline, and corrective actions. Add regression coverage before retrying the
release. A retry receives a new patch version and repeats the complete approval
process; released versions and tags are never reused.
