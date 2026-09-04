import { spawnSync } from "node:child_process";
import process from "node:process";

const auditArguments = [
  "audit",
  "--audit-level=high",
  "--fetch-timeout=30000",
  "--json",
];

export const hasAuditMetadata = (output) => {
  try {
    const report = JSON.parse(output);
    return Boolean(report?.metadata?.vulnerabilities);
  } catch {
    return false;
  }
};

const printResult = (result) => {
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
};

const runAudit = (offline = false) =>
  spawnSync(
    process.execPath,
    [
      process.env.npm_execpath,
      ...auditArguments,
      ...(offline ? ["--offline"] : []),
    ],
    { encoding: "utf8" },
  );

if (process.argv[1] === import.meta.filename) {
  const online = runAudit();
  if (online.status === 0 || hasAuditMetadata(online.stdout)) {
    printResult(online);
    process.exitCode = online.status ?? 1;
  } else {
    process.stderr.write(
      "Online npm audit was unavailable; retrying against the local advisory cache.\n",
    );
    const offline = runAudit(true);
    printResult(offline);
    process.exitCode = offline.status ?? 1;
  }
}
