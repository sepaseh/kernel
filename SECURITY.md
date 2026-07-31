# Security Policy

## Supported versions

Kernel is currently maintained on the `main` branch. Security fixes are applied
to the latest code; older commits and forks are not separately supported.

## Reporting a vulnerability

Do not disclose suspected vulnerabilities in a public issue, discussion, pull
request, or commit.

Use the repository's
[private vulnerability reporting](https://github.com/sepaseh/kernel/security/advisories/new)
page to provide:

- A description of the vulnerability and its potential impact.
- Reproduction steps or a minimal proof of concept.
- Affected routes, components, versions, or commits.
- Any suggested mitigation, if known.

If private vulnerability reporting is unavailable, contact the repository
owner privately through their GitHub profile and request a secure communication
channel. Do not include sensitive vulnerability details in the initial public
contact.

Reports will be acknowledged as soon as practical. The maintainer will validate
the issue, determine severity and scope, coordinate a fix, and disclose it after
users have had a reasonable opportunity to update. Please avoid public
disclosure until that process is complete.

## Security expectations

Contributors must not commit credentials, tokens, private keys, production
data, or populated environment files. Use `.env.example` for documented
configuration and rotate any secret that may have been exposed.

## Security assurance

The maintained security program includes:

- The [application threat model](docs/security/threat-model.md).
- The [authentication and session review](docs/security/authentication-review.md).
- The [security testing and review schedule](docs/security/reviews.md).
- Optional manual DAST against an explicitly authorized non-production target.

Security scan artifacts and unresolved vulnerability details are private.
Automated results require human triage and do not replace manual review.
