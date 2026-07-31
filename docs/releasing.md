# Versioning and releases

Kernel follows [Semantic Versioning](https://semver.org/). Versions use
`MAJOR.MINOR.PATCH`:

- `MAJOR` for incompatible behavior or configuration changes.
- `MINOR` for backward-compatible features.
- `PATCH` for backward-compatible fixes.

The current `1.0.0` version is the first stable baseline. Pre-release versions
use SemVer identifiers such as `2.0.0-rc.1`.

## Commit policy

Use Conventional Commits for changes merged into `main`. The release automation
uses these prefixes to determine the next version and build release notes:

- `fix:` produces a patch release.
- `feat:` produces a minor release.
- A `BREAKING CHANGE:` footer or `!` after the type produces a major release.
- `docs:`, `test:`, `refactor:`, `perf:`, `build:`, `ci:`, and `chore:` do not
  request a version bump on their own.

Scopes are optional, for example `feat(auth): add passkey login`. Pull requests
should be squash-merged with a compliant title so each merged change has one
clear release-note entry.

## Automated release flow

After releasable commits reach `main`, the Release workflow creates or updates a
release pull request. That pull request updates:

- `CHANGELOG.md`
- `package.json` and `package-lock.json`
- `.release-please-manifest.json`

Review and merge the release pull request only after its required checks pass.
The next workflow run then creates the `vMAJOR.MINOR.PATCH` tag and GitHub
Release with generated notes. This application is private and is not published
to npm.

Every production release must follow the approval, verification, rollback, and
follow-up steps in the [release operations runbook](release-operations.md).

The workflow uses the repository `GITHUB_TOKEN` by default. If repository policy
requires release pull requests to trigger other workflows, configure a
fine-grained token or GitHub App token as the `RELEASE_PLEASE_TOKEN` repository
secret according to the Release Please documentation.

Do not edit generated version or changelog entries outside a release pull
request, except when correcting the release configuration itself.
