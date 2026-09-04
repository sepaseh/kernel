import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";

import { eq } from "drizzle-orm";

import { createApp } from "./app.ts";
import { createAuth } from "./auth.ts";
import { loadConfig } from "./config.ts";
import { createDatabase } from "./db/client.ts";
import { initializeDatabase } from "./db/initialize.ts";
import { files, settings, user } from "./db/schema.ts";
import { LocalFileStorage } from "./storage/local.ts";
import { MemoryObjectStorage } from "./storage/memory.ts";
import { MinioObjectStorage } from "./storage/minio.ts";

let app: ReturnType<typeof createApp>;
let baseConfig: ReturnType<typeof loadConfig>;
let client: ReturnType<typeof createDatabase>["client"];
let database: ReturnType<typeof createDatabase>["database"];
let storage: MemoryObjectStorage;
let tempDirectory: string;
let token: string;

const request = (path: string, init: RequestInit = {}) =>
  app.request(`http://localhost${path}`, init);

const authenticated = (init: RequestInit = {}): RequestInit => ({
  ...init,
  headers: {
    Authorization: `Bearer ${token}`,
    ...init.headers,
  },
});

before(async () => {
  tempDirectory = await mkdtemp(path.join(tmpdir(), "kernel-server-"));
  const databasePath = path
    .join(tempDirectory, "test.sqlite")
    .replaceAll("\\", "/");
  baseConfig = loadConfig({
    BETTER_AUTH_SECRET: "test-secret-with-at-least-thirty-two-characters",
    BETTER_AUTH_URL: "http://localhost",
    DATABASE_URL: `file:${databasePath}`,
    OTP_FIXED_CODE: "123456",
    SERVER_ALLOWED_ORIGIN: "http://localhost:5173",
    SERVER_SEED_DEVELOPMENT_DATA: "true",
  });
  ({ client, database } = createDatabase(baseConfig));
  const auth = createAuth(baseConfig, database);
  await initializeDatabase(baseConfig, database, auth);
  storage = new MemoryObjectStorage();
  app = createApp({ auth, config: baseConfig, database, storage });
});

after(async () => {
  await client.close();
  assert.ok(tempDirectory.startsWith(tmpdir()));
  await rm(tempDirectory, {
    force: true,
    maxRetries: 5,
    recursive: true,
    retryDelay: 100,
  });
});

test("never enables synthetic seed data in production", () => {
  const production = loadConfig({
    BETTER_AUTH_SECRET: "production-secret-with-at-least-thirty-two-characters",
    BETTER_AUTH_URL: "https://api.example.com",
    DATABASE_URL: "file:production.sqlite",
    MINIO_ACCESS_KEY: "access-key",
    MINIO_ENDPOINT: "storage.example.com",
    MINIO_PUBLIC_URL: "https://storage.example.com",
    MINIO_SECRET_KEY: "secret-key",
    NODE_ENV: "production",
    SERVER_ALLOWED_ORIGIN: "https://app.example.com",
    SERVER_SEED_DEVELOPMENT_DATA: "true",
  });
  assert.equal(production.seedDevelopmentData, false);
  assert.equal(production.storageDriver, "minio");
  assert.equal(baseConfig.storageDriver, "local");
  assert.throws(() => loadConfig({}), /BETTER_AUTH_SECRET is required/);
  assert.throws(
    () =>
      loadConfig({
        BETTER_AUTH_SECRET:
          "production-secret-with-at-least-thirty-two-characters",
        BETTER_AUTH_URL: "https://api.example.com",
        DATABASE_URL: "file:production.sqlite",
        MINIO_ACCESS_KEY: "access-key",
        MINIO_ENDPOINT: "storage.example.com",
        MINIO_PUBLIC_URL: "https://storage.example.com",
        MINIO_SECRET_KEY: "secret-key",
        NODE_ENV: "production",
        OTP_FIXED_CODE: "123456",
        SERVER_ALLOWED_ORIGIN: "https://app.example.com",
      }),
    /OTP_FIXED_CODE is not allowed in production/,
  );
  assert.equal(
    loadConfig({ BETTER_AUTH_SECRET: "local-secret" }).seedDevelopmentData,
    false,
  );
});

test("stores local objects without allowing path traversal", async () => {
  const local = new LocalFileStorage({
    baseUrl: "http://localhost:3000",
    localStoragePath: path.join(tempDirectory, "uploads"),
  });
  await local.ensureReady();
  await local.put({
    contentType: "text/plain",
    data: new TextEncoder().encode("local file"),
    objectKey: "file-id/example.txt",
    visibility: "public",
  });
  const contents = await local.get("local-public", "file-id/example.txt");
  assert.equal(new TextDecoder().decode(contents), "local file");
  assert.equal(
    local.url("local-public", "file-id/example.txt", "public"),
    "http://localhost:3000/files/file-id/content",
  );
  await assert.rejects(() => local.get("local-public", "../outside.txt"));
  await local.delete("local-public", "file-id/example.txt");
  await assert.rejects(() => local.get("local-public", "file-id/example.txt"));
});

test("requires TLS for non-loopback MinIO endpoints", () => {
  assert.throws(
    () =>
      new MinioObjectStorage({
        ...baseConfig.minio,
        endPoint: "storage.example.com",
        useSSL: false,
      }),
    /TLS is required/,
  );
  assert.doesNotThrow(
    () =>
      new MinioObjectStorage({
        ...baseConfig.minio,
        endPoint: "127.0.0.1",
        useSSL: false,
      }),
  );
});

test("reports health and restricts credentialed CORS", async () => {
  const health = await request("/health");
  assert.deepEqual(await health.json(), { status: "ok" });

  const trusted = await request("/auth/login", {
    headers: { Origin: "http://localhost:5173" },
    method: "OPTIONS",
  });
  assert.equal(
    trusted.headers.get("access-control-allow-origin"),
    "http://localhost:5173",
  );

  const untrusted = await request("/auth/login", {
    headers: { Origin: "http://untrusted.example" },
    method: "OPTIONS",
  });
  assert.equal(untrusted.headers.get("access-control-allow-origin"), null);
});

test("authenticates the seeded account with Better Auth sessions", async () => {
  const login = await request("/auth/login", {
    body: JSON.stringify({
      identifier: "09123456789",
      password: "password123",
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const body = (await login.json()) as { access_token: string };
  assert.equal(login.status, 200);
  assert.ok(body.access_token);
  assert.match(login.headers.get("set-cookie") ?? "", /HttpOnly/i);
  token = body.access_token;

  const account = await request("/account/me", authenticated());
  const accountBody = (await account.json()) as Record<string, unknown>;
  assert.equal(account.status, 200);
  assert.equal(accountBody.is_system_admin, true);
  assert.equal(accountBody.mobile, "09123456789");
  assert.equal(accountBody.email, undefined);
  assert.ok(Array.isArray(accountBody.permissions));
});

test("uses the configured system language for server-owned text", async () => {
  const persianMissing = await request("/missing");
  assert.deepEqual(await persianMissing.json(), {
    message: "مسیر درخواستی وجود ندارد.",
  });

  const persianPermissions = await request(
    "/roles/permissions",
    authenticated(),
  );
  const persianGroups = (await persianPermissions.json()) as Array<{
    title: string;
  }>;
  assert.equal(persianGroups[0]?.title, "تقویم");

  await database
    .update(settings)
    .set({ languageCode: "en" })
    .where(eq(settings.id, 1));
  const englishMissing = await request("/missing");
  assert.deepEqual(await englishMissing.json(), {
    message: "The requested endpoint does not exist.",
  });

  for (const languageCode of ["ar", "de", "es", "fr", "it", "pt", "ru", "tr"]) {
    await database
      .update(settings)
      .set({ languageCode })
      .where(eq(settings.id, 1));
    const localizedMissing = await request("/missing");
    const localizedBody = (await localizedMissing.json()) as {
      message: string;
    };
    assert.notEqual(
      localizedBody.message,
      "The requested endpoint does not exist.",
      `${languageCode} must not fall back to English`,
    );
  }
  await database
    .update(settings)
    .set({ languageCode: "fa" })
    .where(eq(settings.id, 1));
});

test("persists role and user management operations", async () => {
  const roleResponse = await request(
    "/roles",
    authenticated({
      body: JSON.stringify({ name: "بازبین", permissions: ["users.read"] }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }),
  );
  const role = (await roleResponse.json()) as { id: string };
  assert.equal(roleResponse.status, 201);

  const createResponse = await request(
    "/users",
    authenticated({
      body: JSON.stringify({
        first_name: "سارا",
        last_name: "رضایی",
        mobile: "09120000000",
        password: "password123",
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }),
  );
  const created = (await createResponse.json()) as {
    email?: string;
    id: string;
    status: string;
  };
  assert.equal(createResponse.status, 201);
  assert.equal(created.status, "active");
  assert.equal(created.email, undefined);
  const storedUser = await database.query.user.findFirst({
    where: eq(user.id, created.id),
  });
  assert.equal(storedUser?.profileEmail, null);
  assert.match(storedUser?.email ?? "", /@kernel\.local$/);

  const assign = await request(
    `/users/${created.id}/roles`,
    authenticated({
      body: JSON.stringify({ role_ids: [role.id] }),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    }),
  );
  assert.equal(assign.status, 200);

  const details = await request(`/users/${created.id}`, authenticated());
  const detailsBody = (await details.json()) as {
    roles: Array<{ id: string }>;
  };
  assert.deepEqual(
    detailsBody.roles.map(({ id }) => id),
    [role.id],
  );

  const list = await request(
    "/users?first_name=سار&mobile=09120000000",
    authenticated(),
  );
  const listBody = (await list.json()) as { total: number };
  assert.equal(listBody.total, 1);

  const paginated = await request("/users?size=1&offset=1", authenticated());
  const paginatedBody = (await paginated.json()) as {
    items: unknown[];
    total: number;
  };
  assert.equal(paginatedBody.items.length, 1);
  assert.ok(paginatedBody.total >= 2);

  const administrator = await database.query.user.findFirst({
    where: eq(user.mobile, "09123456789"),
  });
  assert.ok(administrator);
  const demoteFinalAdministrator = await request(
    `/users/${administrator.id}/system-admin`,
    authenticated({
      body: JSON.stringify({ is_system_admin: false }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    }),
  );
  assert.equal(demoteFinalAdministrator.status, 409);

  const login = await request("/auth/login", {
    body: JSON.stringify({
      identifier: "09120000000",
      password: "password123",
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const loginBody = (await login.json()) as { access_token: string };
  assert.equal(login.status, 200);
  const userHeaders = { Authorization: `Bearer ${loginBody.access_token}` };

  const allowed = await request("/users", { headers: userHeaders });
  assert.equal(allowed.status, 200);
  const forbidden = await request("/roles", {
    body: JSON.stringify({ name: "غیرمجاز", permissions: [] }),
    headers: { ...userHeaders, "Content-Type": "application/json" },
    method: "POST",
  });
  assert.equal(forbidden.status, 403);
});

test("stores uploaded bytes in object storage and only metadata in SQLite", async () => {
  const form = new FormData();
  form.set(
    "file",
    new File(["<svg />"], "logo.svg", { type: "image/svg+xml" }),
  );
  form.set("visibility", "public");
  const upload = await request(
    "/files",
    authenticated({ body: form, method: "POST" }),
  );
  const body = (await upload.json()) as {
    content_type: string;
    id: string;
    url: string;
  };
  assert.equal(upload.status, 201);
  assert.equal(body.content_type, "image/svg+xml");
  assert.match(body.url, /^http:\/\/storage\.test\//);

  const metadata = await database.query.files.findFirst({
    where: eq(files.id, body.id),
  });
  assert.equal(metadata?.originalName, "logo.svg");
  assert.equal(metadata?.size, 7);
  assert.equal("contents" in (metadata ?? {}), false);
  assert.equal(storage.objects.size, 1);
  const storedBytes = [...storage.objects.values()][0];
  assert.ok(storedBytes);
  assert.equal(Buffer.from(storedBytes).toString("utf8"), "<svg />");

  const publicContents = await request(`/files/${body.id}/content`);
  assert.equal(publicContents.status, 200);
  assert.equal(
    publicContents.headers.get("content-type"),
    "application/octet-stream",
  );
  assert.match(
    publicContents.headers.get("content-disposition") ?? "",
    /^attachment;/,
  );
  assert.equal(publicContents.headers.get("x-content-type-options"), "nosniff");
  assert.equal(await publicContents.text(), "<svg />");

  const htmlForm = new FormData();
  htmlForm.set(
    "file",
    new File(["<script>alert(1)</script>"], "page.html", {
      type: "text/html",
    }),
  );
  htmlForm.set("visibility", "public");
  const htmlUpload = await request(
    "/files",
    authenticated({ body: htmlForm, method: "POST" }),
  );
  const htmlBody = (await htmlUpload.json()) as { id: string };
  const htmlContents = await request(`/files/${htmlBody.id}/content`);
  assert.equal(
    htmlContents.headers.get("content-type"),
    "application/octet-stream",
  );
  assert.match(
    htmlContents.headers.get("content-disposition") ?? "",
    /^attachment;/,
  );

  const privateForm = new FormData();
  privateForm.set(
    "file",
    new File(["private"], "private.txt", { type: "text/plain" }),
  );
  privateForm.set("visibility", "private");
  const privateUpload = await request(
    "/files",
    authenticated({ body: privateForm, method: "POST" }),
  );
  const privateBody = (await privateUpload.json()) as {
    id: string;
    url?: string;
  };
  assert.equal(privateUpload.status, 201);
  assert.equal(privateBody.url, undefined);
  const privateContents = await request(`/files/${privateBody.id}/content`);
  assert.equal(privateContents.status, 404);
});

test("registers a new persisted account after OTP verification", async () => {
  const otp = await request("/auth/otp-request", {
    body: JSON.stringify({ mobile: "09121111111", purpose: "register" }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  assert.equal(otp.status, 200);
  const throttledOtp = await request("/auth/otp-request", {
    body: JSON.stringify({ mobile: "09121111111", purpose: "register" }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  assert.equal(throttledOtp.status, 429);

  const registration = await request("/auth/register", {
    body: JSON.stringify({
      first_name: "آدا",
      last_name: "لاولیس",
      mobile: "09121111111",
      otp: "123456",
      password: "password123",
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const body = (await registration.json()) as { access_token: string };
  assert.equal(registration.status, 201);
  assert.ok(body.access_token);
  assert.match(registration.headers.get("set-cookie") ?? "", /Path=\//);

  const account = await request("/account/me", {
    headers: { Authorization: `Bearer ${body.access_token}` },
  });
  const accountBody = (await account.json()) as { mobile: string };
  assert.equal(accountBody.mobile, "09121111111");

  const cookie = registration.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie);
  const refresh = await request("/auth/refresh-token", {
    headers: { Cookie: cookie },
    method: "POST",
  });
  const refreshBody = (await refresh.json()) as { access_token: string };
  assert.equal(refresh.status, 200);
  assert.ok(refreshBody.access_token);

  const logout = await request("/auth/logout", {
    headers: { Authorization: `Bearer ${body.access_token}` },
    method: "POST",
  });
  assert.equal(logout.status, 200);
  const revoked = await request("/account/me", {
    headers: { Authorization: `Bearer ${body.access_token}` },
  });
  assert.equal(revoked.status, 401);
});

test("keeps profile email optional and stores it only after verification", async () => {
  const login = await request("/auth/login", {
    body: JSON.stringify({
      identifier: "09123456789",
      password: "password123",
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const loginBody = (await login.json()) as { access_token: string };
  assert.equal(login.status, 200);
  const asAdmin = (init: RequestInit = {}): RequestInit => ({
    ...init,
    headers: {
      Authorization: `Bearer ${loginBody.access_token}`,
      ...init.headers,
    },
  });

  const before = await request("/account/me", asAdmin());
  const beforeBody = (await before.json()) as { email?: string };
  assert.equal(beforeBody.email, undefined);

  const requested = await request(
    "/account/request-email-verification",
    asAdmin({
      body: JSON.stringify({ email: "admin@example.com" }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }),
  );
  assert.equal(requested.status, 200);

  const verified = await request(
    "/account/verify-email",
    asAdmin({
      body: JSON.stringify({ email: "admin@example.com", otp: "123456" }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }),
  );
  assert.equal(verified.status, 200);

  const after = await request("/account/me", asAdmin());
  const afterBody = (await after.json()) as { email?: string };
  assert.equal(afterBody.email, "admin@example.com");
});
