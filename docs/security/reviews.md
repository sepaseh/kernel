# Security testing and review schedule

Security checks are defense in depth and do not replace review by a qualified
person.

| Activity                                      | Frequency                    | Owner                          | Evidence                               |
| --------------------------------------------- | ---------------------------- | ------------------------------ | -------------------------------------- |
| Dependency audit, CodeQL, and secret scanning | Every change                 | Maintainer                     | Required CI checks                     |
| Authorized DAST scan                          | Manually when staging exists | Security reviewer              | Private workflow artifact              |
| Threat-model review                           | On trust-boundary changes    | Security reviewer              | Reviewed document change               |
| Authentication/session review                 | On authentication changes    | Frontend and API owners        | Completed checklist                    |
| Manual application security review            | Before a production launch   | Independent qualified reviewer | Private report and tracked remediation |

## Finding handling

Triage every finding for exploitability, affected versions, data exposure, and
release impact. Handle sensitive details through GitHub private vulnerability
reporting. Assign an owner and due date, add regression coverage, and rerun the
relevant check after remediation.

Critical or actively exploited findings block deployment. High-severity
findings block the affected release unless the security owner documents a
time-limited exception with compensating controls.

Kernel keeps the DAST workflow only as a reusable template for downstream
projects; it is not part of Kernel's active quality gate. The workflow has no
schedule and can only be started manually.

Before using the template, configure protected repository or environment
variables `PRODUCTION_HOST` and `STAGING_ALLOWED_APP_HOST` with exact hostnames
only, without a protocol, port, path, or whitespace. `STAGING_ALLOWED_APP_HOST`
is the trusted authorization source for each manual DAST target; workflow
dispatch callers cannot redefine it. `PRODUCTION_HOST` prevents scanning
production and must never match the authorized staging host.
