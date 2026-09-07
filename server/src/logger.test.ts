import assert from "node:assert/strict";
import { test } from "node:test";

import { DrizzleQueryError } from "drizzle-orm/errors";

import { loadLoggingConfig } from "./config.ts";
import { serializeLogError } from "./log-sanitization.ts";
import { createAuthLogger, requestLogContext } from "./logger.ts";
import { captureLogs } from "./test/logging.ts";

test("writes JSON with standard levels, UTC time, environment, and release", () => {
  const output = captureLogs();
  for (const level of ["debug", "info", "warn", "error"] as const) {
    output.logger[level]({ event: "test.event" }, "Test event");
  }
  assert.deepEqual(
    output.records().map((record) => record.level),
    [20, 30, 40, 50],
  );
  for (const record of output.records()) {
    assert.equal(record.environment, "test");
    assert.equal(record.release, "test-release");
    assert.equal(record.service, "kernel-api");
    assert.match(String(record.time), /^\d{4}-\d{2}-\d{2}T.*Z$/);
  }
  const filtered = captureLogs({
    environment: "test",
    level: "warn",
    pretty: false,
    release: "test",
  });
  filtered.logger.debug("Hidden debug");
  filtered.logger.info("Hidden info");
  filtered.logger.warn("Visible warning");
  assert.equal(filtered.records().length, 1);
});

test("limits pretty output to development and validates logging configuration", () => {
  assert.equal(loadLoggingConfig({}).pretty, true);
  assert.equal(loadLoggingConfig({ NODE_ENV: "test" }).pretty, false);
  assert.equal(
    loadLoggingConfig({ SERVER_ENVIRONMENT: "staging" }).pretty,
    false,
  );
  const production = loadLoggingConfig({
    NODE_ENV: "production",
    SERVER_RELEASE_ID: "commit-123",
  });
  assert.equal(production.pretty, false);
  assert.equal(production.level, "info");
  assert.throws(() => loadLoggingConfig({ LOG_LEVEL: "verbose" }), /LOG_LEVEL/);
  assert.throws(
    () => loadLoggingConfig({ NODE_ENV: "production" }),
    /SERVER_RELEASE_ID/,
  );
  assert.throws(
    () => loadLoggingConfig({ SERVER_RELEASE_ID: "invalid\nrelease" }),
    /invalid/,
  );
});

test("redacts nested credentials, cookies, OTP, database and storage data including child bindings", () => {
  const output = captureLogs();
  const fields = {
    AUTHORIZATION: "synthetic-auth",
    access_token: "synthetic-access",
    currentPassword: "synthetic-current",
    databaseUrl: "file:synthetic-private.sqlite",
    deep: [
      {
        cookie: "synthetic-cookie",
        safe: { OTP_CODE: "synthetic-otp", secretKey: "synthetic-secret" },
      },
    ],
    minio: {
      endPoint: "synthetic-internal-host",
      secretKey: "synthetic-minio",
    },
    new_password: "synthetic-new",
    refreshToken: "synthetic-refresh",
    safe: "retained",
    "set-cookie": "synthetic-set-cookie",
  };
  const child = output.logger.child({
    password: "synthetic-child",
    requestId: "request-123",
  });
  child.info(fields, "Safe message");
  assert.doesNotMatch(output.lines.join(""), /synthetic-/);
  assert.equal(output.records()[0].safe, "retained");
  assert.equal(output.records()[0].requestId, "request-123");
  assert.equal(fields.currentPassword, "synthetic-current");
});

test("removes credentials and URLs from text and never interpolates arbitrary arguments", () => {
  const output = captureLogs();
  output.logger.info(
    {
      detail:
        "Bearer synthetic-bearer https://internal.example/private?token=synthetic-query",
    },
    "password=synthetic-password",
  );
  output.logger.info("message %s", "synthetic-interpolation");
  assert.doesNotMatch(output.lines.join(""), /synthetic-|internal\.example/);
});

test("serializes safe stack locations and cause chains without SQL, parameters or SDK properties", () => {
  const output = captureLogs();
  const sql = new DrizzleQueryError(
    "select synthetic-query",
    ["synthetic-param"],
    new Error("synthetic-driver"),
  );
  const outer = new Error("synthetic-wrapper", { cause: sql });
  Object.assign(outer, {
    code: "ECONNREFUSED",
    request: { url: "synthetic-url" },
    password: "synthetic-password",
  });
  output.logger.error({ err: outer }, "Operation failed");
  output.logger.error(outer);
  assert.doesNotMatch(output.lines.join(""), /synthetic-|select /);
  const serialized = output.records()[0].err as Record<string, unknown>;
  assert.equal(serialized.type, "Error");
  assert.equal(serialized.code, "ECONNREFUSED");
  assert.match(String(serialized.stack), /logger.test.ts:\d+:\d+/);
  assert.ok(serialized.cause);
  assert.ok((output.records()[1].err as Record<string, unknown>).stack);
});

test("handles aggregate errors, cycles, deep metadata, getters and non-Error throws", () => {
  const output = captureLogs();
  const cyclic = new Error("synthetic-cycle");
  cyclic.cause = cyclic;
  output.logger.error({
    err: new AggregateError(
      [cyclic, "synthetic-non-error"],
      "synthetic-aggregate",
    ),
  });
  output.logger.error({ err: "synthetic-raw-throw" });
  const circular: Record<string, unknown> = { safe: 7 };
  circular.self = circular;
  Object.defineProperty(circular, "getter", {
    enumerable: true,
    get() {
      throw new Error("Must not call getters");
    },
  });
  output.logger.info({ circular, buffer: Buffer.from("synthetic-buffer") });
  assert.doesNotMatch(output.lines.join(""), /synthetic-/);
  assert.equal(serializeLogError("synthetic-throw").type, "NonError");
  assert.equal(
    (output.records()[2].circular as Record<string, unknown>).safe,
    7,
  );
});

test("routes Better Auth diagnostics through the active request logger without raw arguments", async () => {
  const output = captureLogs();
  const authLogger = createAuthLogger(output.logger);
  await Promise.all(
    ["first", "second"].map((requestId) =>
      requestLogContext.run(
        { logger: output.logger.child({ requestId }) },
        async () => {
          await Promise.resolve();
          authLogger.log(
            "error",
            "synthetic-provider-message",
            new Error("synthetic-provider-error"),
          );
        },
      ),
    ),
  );
  authLogger.log("warn", "synthetic-startup-message");
  assert.deepEqual(
    output
      .records()
      .slice(0, 2)
      .map((record) => record.requestId)
      .sort(),
    ["first", "second"],
  );
  assert.equal(output.records()[2].requestId, undefined);
  assert.doesNotMatch(output.lines.join(""), /synthetic-/);
});
