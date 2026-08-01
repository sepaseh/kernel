# AI assistant entry point

Before changing this repository, read `.agents/README.md` and the relevant files
under `.agents/rules/`. Treat `.agents/settings.json` as the machine-readable
index of those rules and optional hooks.

Use repository scripts for validation, preserve user changes, and never commit,
push, edit secrets, or contact production services without explicit user
authorization. Start with the smallest relevant check and follow
`CONTRIBUTING.md` before preparing a pull request.

The documentation map in `docs/README.md` identifies the source of truth for
each project subsystem. Update the corresponding document whenever behavior,
configuration, test coverage, or operational workflow changes.
