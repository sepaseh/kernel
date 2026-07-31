# Mutation and contract testing

## Mutation testing

`npm run test:mutation` uses Stryker to make controlled faults in the token,
storage, error, and data-transformation modules. The existing unit tests must
detect, or “kill,” at least 80% of generated mutants for the command to pass.
Scores below 90% remain visible for improvement.

The focused scope covers small, security-sensitive modules and keeps feedback
practical. Expand it as dedicated unit coverage grows. Do not exclude a mutant
only to raise the score; add an assertion or document why the mutation is
equivalent to the original behavior.

Mutation testing runs weekly or on manual request, outside the pull-request
feedback loop. Reports are retained as private workflow artifacts.

## Consumer contracts

`npm run test:contract` exercises the real frontend API modules against a Pact
mock provider. It verifies the request method, path, JSON body, wire-format
field names, response shape, and the frontend's snake-case to camel-case
transformation.

The generated `pacts/kernel-web-kernel-api.json` contract is a CI artifact.
Kernel does not currently assume a Pact Broker or provider-verification
pipeline. A downstream project should verify the contract against its candidate
API before treating Pact as a deployment gate. When a broker is configured,
publish it using the frontend commit SHA as the consumer version and the branch
or release environment for deployment metadata.

Once provider verification is adopted, changes are compatible only when:

- Consumer contract generation passes.
- The provider verifies every interaction.
- The broker's deployment check reports that the frontend and API versions can
  be deployed together.

Add interactions when the frontend adopts a new endpoint or materially depends
on a new request or response field. Keep provider states deterministic and
free of production data. Pact files are generated evidence and are not
committed.
