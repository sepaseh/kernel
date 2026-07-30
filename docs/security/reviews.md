# Security testing and review schedule

Security checks are defense in depth and do not replace review by a qualified
person.

| Activity                                      | Frequency                                   | Owner                          | Evidence                               |
| --------------------------------------------- | ------------------------------------------- | ------------------------------ | -------------------------------------- |
| Dependency audit, CodeQL, and secret scanning | Every change                                | Maintainer                     | Required CI checks                     |
| Staging DAST full scan                        | Monthly and before major releases           | Security reviewer              | Private workflow artifact              |
| Threat-model review                           | Quarterly and on trust-boundary changes     | Security reviewer              | Reviewed document change               |
| Authentication/session review                 | Quarterly and on auth changes               | Frontend and API owners        | Completed checklist                    |
| Manual application security review            | At least annually and before major releases | Independent qualified reviewer | Private report and tracked remediation |
| Rollback exercise                             | At least twice yearly                       | Release manager                | Exercise record                        |

## DAST rules

The `DAST` workflow runs an active OWASP ZAP full scan against the repository
variable `STAGING_BASE_URL`. The target must be an explicitly authorized,
disposable staging environment. Active scans may submit forms, create data,
trigger email or OTP delivery, and place load on the API.

Before enabling the schedule:

1. Obtain written authorization from the application, API, hosting, CDN, and
   security owners.
2. Seed non-sensitive test data and disable real notifications or downstream
   side effects.
3. Confirm backups, rate limits, monitoring, and a cleanup procedure.
4. Set `STAGING_BASE_URL` to the exact HTTPS application origin.
5. Run the workflow manually and review the private artifact.

The job fails on reported alerts. Do not suppress a rule merely to make the
scan pass. Record a suppression only after review, with the rule ID, affected
URL, evidence, owner, expiry date, and justification.

Do not run active DAST against production. Authenticated scanning requires a
separate least-privileged test account, explicit scope approval, and secure
injection of short-lived credentials; never commit scan credentials.

## Finding handling

Triage every finding for exploitability, affected versions, data exposure, and
release impact. Handle sensitive details through GitHub private vulnerability
reporting. Assign an owner and due date, add regression coverage, and rerun the
relevant scan after remediation.

Critical or actively exploited findings block deployment and trigger the
incident process. High-severity findings block the affected release unless the
security owner documents a time-limited exception with compensating controls.
