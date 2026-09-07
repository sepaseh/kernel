import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";

import { and, eq } from "drizzle-orm";

import { tinyId } from "../../src/shared/lib/id.ts";
import { createApp } from "./app.ts";
import { createAuth } from "./auth.ts";
import { loadConfig } from "./config.ts";
import { createDatabase } from "./db/client.ts";
import { initializeDatabase } from "./db/initialize.ts";
import { user } from "./db/schema.ts";
import { createLogger } from "./logger.ts";
import { MemoryObjectStorage } from "./storage/memory.ts";

let app: ReturnType<typeof createApp>;
let client: ReturnType<typeof createDatabase>["client"];
let database: ReturnType<typeof createDatabase>["database"];
let administratorId: string;
let administratorToken: string;
let targetId: string;

const originalPassword = "original-test-password";
const targetMobile = "09120000002";

const request = (
  endpoint: string,
  method: string,
  body?: Record<string, unknown>,
  token?: string,
) =>
  app.request(`http://localhost${endpoint}`, {
    ...(body && { body: JSON.stringify(body) }),
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    method,
  });

beforeEach(async () => {
  const config = loadConfig({
    BETTER_AUTH_SECRET: "synthetic-secret-with-at-least-thirty-two-characters",
    BETTER_AUTH_URL: "http://localhost",
    DATABASE_URL: "file::memory:",
    OTP_FIXED_CODE: "123456",
  });
  ({ client, database } = createDatabase(config));
  const logger = createLogger(config.logging, { write() {} });
  const auth = createAuth(config, database, logger);
  await initializeDatabase(config, database, auth);
  app = createApp({
    auth,
    config,
    database,
    logger,
    storage: new MemoryObjectStorage(),
  });
  const administrator = await auth.api.signUpEmail({
    body: {
      email: "administrator@kernel.local",
      firstName: "Test",
      lastName: "Administrator",
      mobile: "09120000001",
      name: "Test Administrator",
      password: originalPassword,
    },
  });
  administratorId = administrator.user.id;
  await database
    .update(user)
    .set({ isSystemAdmin: true })
    .where(eq(user.id, administratorId));
  const login = await request("/auth/login", "POST", {
    identifier: "09120000001",
    password: originalPassword,
  });
  assert.equal(login.status, 200);
  administratorToken = ((await login.json()) as { access_token: string })
    .access_token;
  const target = await auth.api.signUpEmail({
    body: {
      email: "target@kernel.local",
      firstName: "Test",
      lastName: "Target",
      mobile: targetMobile,
      name: "Test Target",
      password: originalPassword,
    },
  });
  targetId = target.user.id;
});

afterEach(async () => {
  await client.close();
});

const removals = [
  { body: undefined, method: "DELETE", name: "deletion", suffix: "" },
  {
    body: { status: "inactive" },
    method: "PATCH",
    name: "deactivation",
    suffix: "/status",
  },
  {
    body: { is_system_admin: false },
    method: "PATCH",
    name: "demotion",
    suffix: "/system-admin",
  },
] as const;

test("accepts the frontend-generated password when creating a user", async () => {
  const password = tinyId();
  const response = await request(
    "/users",
    "POST",
    {
      first_name: "Test",
      last_name: "Generated",
      mobile: "09120000003",
      password,
    },
    administratorToken,
  );
  assert.equal(response.status, 201);
  const login = await request("/auth/login", "POST", {
    identifier: "09120000003",
    password,
  });
  assert.equal(login.status, 200);
});

test("accepts the frontend-generated password in an administrator reset", async () => {
  const password = tinyId();
  const response = await request(
    `/users/${targetId}/password`,
    "PUT",
    { password },
    administratorToken,
  );
  assert.equal(response.status, 200);
  const login = await request("/auth/login", "POST", {
    identifier: targetMobile,
    password,
  });
  assert.equal(login.status, 200);
});

for (const removal of removals) {
  for (const transition of ["activation", "promotion"] as const) {
    test(`protects the final administrator from ${removal.name} after concurrent ${transition}`, async (context) => {
      if (transition === "activation") {
        await database
          .update(user)
          .set({ isSystemAdmin: true, status: "inactive" })
          .where(eq(user.id, targetId));
      }

      // Complete another administrator's requests after the pending request's
      // initial reads, but before its write transaction acquires the lock.
      const transaction = database.transaction.bind(database);
      const intercepted = context.mock.method(
        database,
        "transaction",
        async (...args: Parameters<typeof transaction>) => {
          intercepted.mock.restore();
          const promote = await request(
            `/users/${targetId}${transition === "activation" ? "/status" : "/system-admin"}`,
            "PATCH",
            transition === "activation"
              ? { status: "active" }
              : { is_system_admin: true },
            administratorToken,
          );
          assert.equal(promote.status, 200);
          const demote = await request(
            `/users/${administratorId}/system-admin`,
            "PATCH",
            { is_system_admin: false },
            administratorToken,
          );
          assert.equal(demote.status, 200);
          return transaction(...args);
        },
      );

      const response = await request(
        `/users/${targetId}${removal.suffix}`,
        removal.method,
        removal.body,
        administratorToken,
      );
      assert.equal(response.status, 409);
      const remaining = await database
        .select({ id: user.id })
        .from(user)
        .where(and(eq(user.isSystemAdmin, true), eq(user.status, "active")));
      assert.deepEqual(remaining, [{ id: targetId }]);
    });
  }

  test(`allows ${removal.name} when another active administrator remains`, async () => {
    await database
      .update(user)
      .set({ isSystemAdmin: true })
      .where(eq(user.id, targetId));
    const response = await request(
      `/users/${targetId}${removal.suffix}`,
      removal.method,
      removal.body,
      administratorToken,
    );
    assert.equal(response.status, 200);
    const remaining = await database
      .select({ id: user.id })
      .from(user)
      .where(and(eq(user.isSystemAdmin, true), eq(user.status, "active")));
    assert.deepEqual(remaining, [{ id: administratorId }]);
  });
}

for (const length of [7, 129]) {
  test(`rejects a ${length}-character recovery password without consuming the OTP`, async () => {
    const otp = await request("/auth/otp-request", "POST", {
      mobile: targetMobile,
      purpose: "forgot_password",
    });
    assert.equal(otp.status, 200);
    const body = { mobile: targetMobile, otp: "123456" };
    const rejected = await request("/auth/forgot-password", "POST", {
      ...body,
      password: "x".repeat(length),
    });
    assert.equal(rejected.status, 400);
    const unchanged = await request("/auth/login", "POST", {
      identifier: targetMobile,
      password: originalPassword,
    });
    assert.equal(unchanged.status, 200);
    const accepted = await request("/auth/forgot-password", "POST", {
      ...body,
      password: "replacement-test-password",
    });
    assert.equal(accepted.status, 200);
    assert.equal(await accepted.text(), "");
    const replay = await request("/auth/forgot-password", "POST", {
      ...body,
      password: originalPassword,
    });
    assert.equal(replay.status, 400);
    const login = await request("/auth/login", "POST", {
      identifier: targetMobile,
      password: "replacement-test-password",
    });
    assert.equal(login.status, 200);
  });

  test(`rejects a ${length}-character administrator reset password`, async () => {
    const response = await request(
      `/users/${targetId}/password`,
      "PUT",
      { password: "x".repeat(length) },
      administratorToken,
    );
    assert.equal(response.status, 400);
    const login = await request("/auth/login", "POST", {
      identifier: targetMobile,
      password: originalPassword,
    });
    assert.equal(login.status, 200);
  });
}
