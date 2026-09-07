import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";

import { APIError } from "better-auth/api";
import { eq } from "drizzle-orm";

import { createApp } from "./app.ts";
import { createAuth } from "./auth.ts";
import { loadConfig } from "./config.ts";
import { createDatabase } from "./db/client.ts";
import { initializeDatabase } from "./db/initialize.ts";
import { user } from "./db/schema.ts";
import type { Dependencies } from "./dependencies.ts";
import { ApiError, authenticate } from "./http.ts";
import { MemoryObjectStorage } from "./storage/memory.ts";
import { captureLogs } from "./test/logging.ts";

let app: ReturnType<typeof createApp>;
let dependencies: Dependencies;
let client: ReturnType<typeof createDatabase>["client"];
let storage: MemoryObjectStorage;
let output: ReturnType<typeof captureLogs>;

beforeEach(async () => {
  const config = loadConfig({
    BETTER_AUTH_SECRET: "synthetic-test-secret-at-least-thirty-two-characters",
    BETTER_AUTH_URL: "http://localhost",
    DATABASE_URL: "file::memory:",
    NODE_ENV: "test",
    OTP_FIXED_CODE: "123456",
  });
  const created = createDatabase(config);
  client = created.client;
  output = captureLogs(config.logging);
  storage = new MemoryObjectStorage();
  const auth = createAuth(config, created.database, output.logger);
  await initializeDatabase(config, created.database, auth);
  dependencies = {
    auth,
    config,
    database: created.database,
    logger: output.logger,
    storage,
  };
  app = createApp(dependencies);
  output.lines.length = 0;
});

afterEach(() => client.close());

const jsonRequest = (
  path: string,
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
) =>
  app.request(path, {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", ...headers },
    method: "POST",
  });

const login = async (mobile = "09120000001", administrator = false) => {
  const created = await dependencies.auth.api.signUpEmail({
    body: {
      email: `${mobile}@kernel.test`,
      firstName: "Test",
      lastName: "User",
      mobile,
      name: "Test User",
      password: "synthetic-password",
    },
  });
  if (administrator)
    await dependencies.database
      .update(user)
      .set({ isSystemAdmin: true })
      .where(eq(user.id, created.user.id));
  const response = await jsonRequest("/auth/login", {
    identifier: mobile,
    password: "synthetic-password",
  });
  assert.equal(response.status, 200);
  const result = (await response.json()) as { access_token: string };
  return { id: created.user.id, token: result.access_token };
};

const completed = () =>
  output.records().filter((record) => record.event === "api.request.completed");

test("creates or propagates a bounded request ID and logs exactly one final result", async () => {
  for (const supplied of [
    undefined,
    "client-request_123",
    "",
    "bad.value",
    "x".repeat(129),
    "bad,value",
    "token=synthetic-credential",
    "09120000001",
  ]) {
    const response = await app.request("/health?token=synthetic-query", {
      headers: supplied === undefined ? {} : { "X-Request-Id": supplied },
    });
    const id = response.headers.get("x-request-id");
    assert.match(id ?? "", /^[\w=-]{1,128}$/);
    if (supplied === "client-request_123") assert.equal(id, supplied);
    else assert.match(id ?? "", /^[0-9a-f-]{36}$/);
    const record = completed().at(-1)!;
    assert.equal(record.requestId, id);
    assert.equal(record.method, "GET");
    assert.equal(record.path, "/health");
    assert.equal(record.status, 200);
    assert.ok(typeof record.durationMs === "number" && record.durationMs >= 0);
  }
  assert.equal(completed().length, 8);
  assert.doesNotMatch(output.lines.join(""), /synthetic-query/);
});

test("includes correlation on CORS preflights and exposes the response header", async () => {
  const response = await app.request("/health", {
    headers: {
      Origin: "http://localhost:5173",
      "Access-Control-Request-Method": "GET",
      "Access-Control-Request-Headers": "X-Request-Id",
      "X-Request-Id": "preflight-123",
    },
    method: "OPTIONS",
  });
  assert.equal(response.status, 204);
  assert.match(
    response.headers.get("access-control-allow-headers") ?? "",
    /X-Request-Id/i,
  );
  assert.equal(response.headers.get("x-request-id"), "preflight-123");
  assert.equal(completed()[0].status, 204);
  const actual = await app.request("/health", {
    headers: { Origin: "http://localhost:5173" },
  });
  assert.match(
    actual.headers.get("access-control-expose-headers") ?? "",
    /X-Request-Id/i,
  );
});

test("records expected errors without stacks and hides untrusted unmatched paths", async () => {
  const unauthorized = await app.request("/account/me");
  const missing = await app.request(
    "/synthetic-private-path?password=synthetic-secret",
  );
  const invalid = await app.request("/auth/login", {
    body: "not-json",
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  assert.deepEqual(
    [unauthorized.status, missing.status, invalid.status],
    [401, 404, 400],
  );
  assert.deepEqual(
    completed().map((record) => record.status),
    [401, 404, 400],
  );
  assert.ok(
    completed().every(
      (record) =>
        record.level === 40 &&
        record.err === undefined &&
        record.userId === undefined,
    ),
  );
  assert.doesNotMatch(
    output.lines.join(""),
    /synthetic-private|synthetic-secret/,
  );
});

test("captures a failure before routing even when translation cannot be loaded", async (t) => {
  t.mock.method(dependencies.database.query.settings, "findFirst", async () => {
    throw new Error("synthetic-database-password");
  });
  const response = await app.request("/health");
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {
    message: "Internal server error.",
  });
  const record = completed()[0];
  assert.equal(record.level, 50);
  assert.equal(record.requestId, response.headers.get("x-request-id"));
  assert.ok((record.err as Record<string, unknown>).stack);
  assert.equal(completed().length, 1);
  assert.doesNotMatch(output.lines.join(""), /synthetic-database-password/);
});

test("handles Error and non-Error route throws without leaking them into the API", async () => {
  app.get("/test-error", () => {
    throw new Error("synthetic-exception");
  });
  app.get("/test-non-error", () => {
    throw "synthetic-thrown-value";
  });
  app.get("/test-api-error", () => {
    throw new ApiError(500, "tokenNotIssued");
  });
  for (const path of ["/test-error", "/test-non-error", "/test-api-error"]) {
    const response = await app.request(path);
    assert.equal(response.status, 500);
    assert.ok(response.headers.get("x-request-id"));
    assert.doesNotMatch(await response.text(), /synthetic-|stack|cause/);
  }
  assert.equal(completed().length, 3);
  assert.ok(completed().every((record) => record.err && record.level === 50));
  assert.doesNotMatch(output.lines.join(""), /synthetic-/);
});

test("adds user identity only after authentication, including permission failures", async () => {
  const account = await login();
  assert.equal(completed().at(-1)!.userId, account.id);
  output.lines.length = 0;
  const response = await app.request("/users", {
    headers: { Authorization: `Bearer ${account.token}` },
  });
  assert.equal(response.status, 403);
  assert.equal(completed()[0].userId, account.id);
  await jsonRequest(
    "/auth/refresh-token",
    {},
    { Authorization: `Bearer ${account.token}` },
  );
  assert.equal(completed()[1].userId, account.id);
  await jsonRequest("/auth/login", {
    identifier: "09120000001",
    password: "synthetic-wrong",
  });
  const failed = output
    .records()
    .find((record) => record.event === "auth.login.failed")!;
  assert.equal(failed.userId, undefined);
  assert.equal(failed.level, 40);
  assert.doesNotMatch(
    output.lines.join(""),
    /synthetic-password|synthetic-wrong|09120000001/,
  );
  assert.ok(!output.lines.join("").includes(account.token));
});

test("keeps overlapping requests and unauthenticated requests isolated", async () => {
  const first = await login("09120000001");
  const second = await login("09120000002");
  app = createApp(dependencies);
  let arrivals = 0;
  let release!: () => void;
  const barrier = new Promise<void>((resolve) => {
    release = resolve;
  });
  app.get("/test-overlap", async (context) => {
    await authenticate(context);
    if (++arrivals === 2) release();
    await barrier;
    context.get("logger").info({ event: "test.overlap" }, "Concurrent request");
    return context.json({ ok: true });
  });
  output.lines.length = 0;
  await Promise.all([
    app.request("/test-overlap", {
      headers: {
        Authorization: `Bearer ${first.token}`,
        "X-Request-Id": "first-request",
      },
    }),
    app.request("/test-overlap", {
      headers: {
        Authorization: `Bearer ${second.token}`,
        "X-Request-Id": "second-request",
      },
    }),
    app.request("/health", { headers: { "X-Request-Id": "public-request" } }),
  ]);
  for (const [requestId, userId] of [
    ["first-request", first.id],
    ["second-request", second.id],
    ["public-request", undefined],
  ]) {
    const records = output
      .records()
      .filter((record) => record.requestId === requestId);
    assert.ok(records.length > 0);
    assert.ok(records.every((record) => record.userId === userId));
  }
});

test("keeps unexpected auth failures as 500 while expected credentials remain 400", async (t) => {
  await login();
  output.lines.length = 0;
  const signIn = t.mock.method(
    dependencies.auth.api,
    "signInEmail",
    async () => {
      throw new Error("synthetic-provider-outage");
    },
  );
  const failed = await jsonRequest("/auth/login", {
    identifier: "09120000001",
    password: "synthetic-password",
  });
  assert.equal(failed.status, 500);
  assert.equal(completed()[0].level, 50);
  assert.ok(completed()[0].err);
  signIn.mock.mockImplementation(async () => {
    throw new APIError("UNAUTHORIZED", {
      message: "synthetic-provider-rejection",
    });
  });
  const rejected = await jsonRequest("/auth/login", {
    identifier: "09120000001",
    password: "synthetic-password",
  });
  assert.equal(rejected.status, 400);
  assert.equal(completed()[1].err, undefined);
  assert.doesNotMatch(
    output.lines.join(""),
    /synthetic-provider|synthetic-password/,
  );
});

const upload = (token: string) => {
  const form = new FormData();
  form.set(
    "file",
    new File(["synthetic-file-contents"], "synthetic-private-name.txt", {
      type: "text/plain",
    }),
  );
  form.set("visibility", "public");
  return app.request("/files", {
    body: form,
    headers: { Authorization: `Bearer ${token}` },
    method: "POST",
  });
};

for (const flow of [
  "registration",
  "user creation",
  "password change",
] as const) {
  test(`reports unexpected provider failures during ${flow} as generic 500 errors`, async (t) => {
    const actor = await login("09120000001", true);
    output.lines.length = 0;
    const method =
      flow === "password change" ? "changePassword" : "signUpEmail";
    t.mock.method(dependencies.auth.api, method, async () => {
      throw new Error("synthetic-internal-provider-data");
    });
    let response: Response;
    if (flow === "password change") {
      response = await jsonRequest(
        "/auth/change-password",
        {
          current_password: "synthetic-password",
          new_password: "synthetic-new-password",
        },
        { Authorization: `Bearer ${actor.token}` },
      );
    } else {
      const body = {
        first_name: "Test",
        last_name: "New",
        mobile: "09120000003",
        password: "synthetic-new-password",
      };
      if (flow === "registration") {
        await jsonRequest("/auth/otp-request", {
          mobile: body.mobile,
          purpose: "register",
        });
        response = await jsonRequest("/auth/register", {
          ...body,
          otp: "123456",
        });
      } else {
        response = await jsonRequest("/users", body, {
          Authorization: `Bearer ${actor.token}`,
        });
      }
    }
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), {
      message: "خطای داخلی سرور رخ داد.",
    });
    assert.ok(completed().at(-1)!.err);
    assert.doesNotMatch(
      output.lines.join(""),
      /synthetic-internal|synthetic-new-password/,
    );
  });
}

test("does not bind inactive accounts or invalid sessions to request logs", async () => {
  const actor = await login();
  await dependencies.database
    .update(user)
    .set({ status: "inactive" })
    .where(eq(user.id, actor.id));
  output.lines.length = 0;
  for (const token of [actor.token, "synthetic-invalid-session"]) {
    const response = await app.request("/account/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(response.status, 401);
  }
  assert.ok(completed().every((record) => record.userId === undefined));
  assert.doesNotMatch(output.lines.join(""), /synthetic-invalid-session/);
});

test("logs safe upload metadata and retains request ID on binary responses", async () => {
  const account = await login("09120000001", true);
  output.lines.length = 0;
  const response = await upload(account.token);
  assert.equal(response.status, 201);
  const result = (await response.json()) as { id: string };
  const event = output
    .records()
    .find((record) => record.event === "file.upload.completed")!;
  assert.equal(event.fileId, result.id);
  assert.equal(event.userId, account.id);
  assert.equal(event.visibility, "public");
  const content = await app.request(`/files/${result.id}/content`, {
    headers: { "X-Request-Id": "binary-request" },
  });
  assert.equal(content.headers.get("x-request-id"), "binary-request");
  assert.equal(await content.text(), "synthetic-file-contents");
  assert.equal(completed().at(-1)!.path, "/files/:fileId/content");
  assert.equal(completed().at(-1)!.userId, undefined);
  assert.doesNotMatch(
    output.lines.join(""),
    /synthetic-private-name|synthetic-file-contents/,
  );
});

test("logs storage write and read failures with the same request ID", async (t) => {
  const account = await login("09120000001", true);
  const existing = await upload(account.token);
  const file = (await existing.json()) as { id: string };
  output.lines.length = 0;
  t.mock.method(storage, "put", async () => {
    throw new Error("synthetic-minio-put-secret");
  });
  t.mock.method(storage, "get", async () => {
    throw new Error("synthetic-minio-get-secret");
  });
  assert.equal((await upload(account.token)).status, 500);
  assert.equal((await app.request(`/files/${file.id}/content`)).status, 500);
  const operations = output
    .records()
    .filter((record) => record.event === "storage.operation.failed");
  assert.deepEqual(
    operations.map((record) => record.operation),
    ["put", "get"],
  );
  assert.ok(
    operations.every((record) =>
      completed().some((request) => request.requestId === record.requestId),
    ),
  );
  assert.equal(output.records().filter((record) => record.err).length, 2);
  assert.doesNotMatch(output.lines.join(""), /synthetic-minio/);
});

test("retains the metadata error and records a distinct cleanup failure", async (t) => {
  const account = await login("09120000001", true);
  output.lines.length = 0;
  t.mock.method(dependencies.database, "insert", () => {
    throw new Error("synthetic-metadata-error");
  });
  t.mock.method(storage, "delete", async () => {
    throw new Error("synthetic-cleanup-error");
  });
  assert.equal((await upload(account.token)).status, 500);
  assert.equal(
    output
      .records()
      .filter((record) => record.event === "storage.cleanup.failed").length,
    1,
  );
  assert.equal(output.records().filter((record) => record.err).length, 2);
  assert.equal(
    output.records().find((record) => record.event === "file.upload.failed")!
      .stage,
    "metadata",
  );
  assert.equal(completed().length, 1);
  assert.doesNotMatch(
    output.lines.join(""),
    /synthetic-metadata|synthetic-cleanup/,
  );
});
