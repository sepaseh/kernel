import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const cwd = fileURLToPath(new URL("../../", import.meta.url));
const environment = {
  NODE_ENV: "test",
  PATH: process.env.PATH,
  SystemRoot: process.env.SystemRoot,
};

for (const failure of ["throw", "rejection"] as const) {
  test(`logs a process ${failure} without leaking stderr and exits unsuccessfully`, () => {
    const result = spawnSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `
      import { createLogger } from './server/src/logger.ts';
      import { installFatalErrorHandlers } from './server/src/lifecycle.ts';
      const logger = createLogger({ environment: 'test', level: 'info', pretty: false, release: 'test-release' });
      installFatalErrorHandlers(logger);
      setTimeout(() => {
        ${failure === "throw" ? "throw new Error('synthetic-process-secret');" : "void Promise.reject(new Error('synthetic-process-secret'));"}
      }, 0);
    `,
      ],
      { cwd, encoding: "utf8", env: environment, timeout: 5_000 },
    );
    assert.equal(result.error, undefined);
    assert.equal(result.status, 1);
    const records = result.stdout
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line) as Record<string, unknown>);
    assert.equal(records.length, 1);
    assert.equal(records[0].event, "server.crashed");
    assert.equal(records[0].release, "test-release");
    assert.equal(records[0].level, 60);
    assert.doesNotMatch(
      result.stdout + result.stderr,
      /synthetic-process-secret/,
    );
  });
}

test("startup configuration failures are structured without opening a database", () => {
  const result = spawnSync(process.execPath, ["server/src/index.ts"], {
    cwd,
    encoding: "utf8",
    env: environment,
    timeout: 5_000,
  });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 1);
  const record = JSON.parse(result.stdout.trim()) as Record<string, unknown>;
  assert.equal(record.event, "server.startup.failed");
  assert.equal(record.environment, "test");
  assert.ok((record.err as Record<string, unknown>).stack);
});

test("development pretty printing preserves the same redaction policy", () => {
  const result = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `
    import { createLogger } from './server/src/logger.ts';
    const logger = createLogger({ environment: 'development', level: 'debug', pretty: true, release: 'local-test' });
    logger.info({ password: 'synthetic-pretty-secret', event: 'test.pretty' }, 'Readable event');
  `,
    ],
    { cwd, encoding: "utf8", env: environment, timeout: 5_000 },
  );
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Readable event/);
  assert.match(result.stdout, /INFO/);
  assert.doesNotMatch(result.stdout + result.stderr, /synthetic-pretty-secret/);
});
