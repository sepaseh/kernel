import { spawnSync } from "node:child_process";
import process from "node:process";

const auditArguments = [
  "audit",
  "--audit-level=high",
  "--fetch-timeout=30000",
  "--json",
];
const auditTimeoutMs = 30_000;
const maximumAttempts = 3;

export const hasAuditMetadata = (output) => {
  try {
    const report = JSON.parse(output);
    return Boolean(report?.metadata?.vulnerabilities);
  } catch {
    return false;
  }
};

export const isCompletedAuditResult = (result) =>
  result.status !== null && hasAuditMetadata(result.stdout);

const printResult = (result) => {
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
};

const runAudit = () =>
  spawnSync(process.execPath, [process.env.npm_execpath, ...auditArguments], {
    encoding: "utf8",
    timeout: auditTimeoutMs,
  });

if (process.argv[1] === import.meta.filename) {
  let lastResult;

  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    lastResult = runAudit();
    if (isCompletedAuditResult(lastResult)) break;

    if (attempt < maximumAttempts) {
      process.stderr.write(
        `Online npm audit was unavailable; retrying (${attempt + 1}/${maximumAttempts}).\n`,
      );
    }
  }

  printResult(lastResult);
  if (isCompletedAuditResult(lastResult)) {
    process.exitCode = lastResult.status;
  } else {
    process.stderr.write(
      "Online npm audit did not return a complete report after 3 attempts.\n",
    );
    process.exitCode = 1;
  }
}
