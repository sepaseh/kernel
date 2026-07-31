# Staging environment

This is an optional, manually invoked capability. The repository does not
currently assume that a staging environment exists.

When provisioned, staging is the production-like release gate for Kernel. It must use the same
build artifact, web-server configuration, routing rules, security headers, and
API contract intended for production.

## Environment requirements

Provide a staging deployment with:

- A stable HTTPS application URL.
- Non-production API, identity, and data stores with production-compatible
  schemas.
- The same CDN, reverse-proxy, cache, and security-header behavior as
  production.
- Sanitized seed data and test accounts. Never copy production credentials,
  tokens, or personal data.
- Access controls that still allow GitHub-hosted test runners to reach the
  application and health endpoint.

Keep staging configuration separate from production secrets. Build once with an
immutable release identifier and promote that artifact between environments;
do not rebuild source specifically for production.

## Manual validation

Configure protected `STAGING_ALLOWED_APP_HOST` and
`STAGING_ALLOWED_API_HOST` repository or environment variables with exact
hostnames only. Start the `Staging validation` workflow manually and supply the
application and API health URLs. It never runs on pull requests, schedules, or
deployment events.

The live suite verifies:

- Application HTML and same-origin assets load successfully.
- Direct client-side routes work.
- Public authentication journeys pass automated accessibility checks.
- CSP, HSTS, framing, MIME-sniffing, referrer, and permissions policies are
  present.
- The staging API health endpoint succeeds.
- The checks pass in Chromium, Firefox, WebKit, and a mobile Chromium viewport.

The workflow rejects missing, non-HTTPS, or credential-bearing target URLs and
retains traces, screenshots, video, and HTML reports when tests fail.

To run the same gate locally:

```bash
STAGING_BASE_URL=https://staging.example.com/ \
STAGING_API_HEALTH_URL=https://staging-api.example.com/health \
npm run test:staging
```

## Promotion

When staging is adopted as a release gate, a release is eligible for production
only when:

1. The ordinary CI and CodeQL checks pass, and SonarQube findings are reviewed.
2. The exact candidate artifact is deployed to staging.
3. The Staging validation workflow passes for that deployment.
4. Any required manual acceptance checks complete.
5. The release manager approves promotion using the
   [release operations runbook](release-operations.md).

Failed staging checks block promotion. Fix the issue through a reviewed change,
create a new candidate artifact, and repeat the complete staging gate.

The separate DAST workflow is a reusable template for downstream projects, not
an active Kernel check. A project adopting it must configure `PRODUCTION_HOST`
and satisfy its authorization, isolation, and side-effect controls before every
manual scan.
