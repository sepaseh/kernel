const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

const { loadRoutes } = require("./collection.cjs");
const { createServer } = require("./server.cjs");

let baseUrl;
let server;
let token;

before(async () => {
  server = createServer(loadRoutes());
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

test("loads every HTTP route from the collection", async () => {
  const response = await fetch(`${baseUrl}/__mock/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, "ok");
  assert.ok(body.route_count > 20);
});

test("allows credentialed CORS for the configured local origin", async () => {
  const response = await fetch(`${baseUrl}/auth/login`, {
    headers: { Origin: "http://127.0.0.1:5173" },
    method: "OPTIONS",
  });

  assert.equal(response.status, 204);
  assert.equal(
    response.headers.get("access-control-allow-origin"),
    "http://127.0.0.1:5173",
  );
  assert.equal(
    response.headers.get("access-control-allow-credentials"),
    "true",
  );
});

test("rejects credentialed CORS for untrusted origins", async () => {
  const response = await fetch(`${baseUrl}/auth/login`, {
    headers: { Origin: "https://untrusted.example" },
    method: "OPTIONS",
  });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), null);
  assert.equal(response.headers.get("access-control-allow-credentials"), null);
});

test("logs in and returns the authenticated account", async () => {
  const login = await fetch(`${baseUrl}/auth/login`, {
    body: JSON.stringify({
      identifier: "09123456789",
      password: "password123",
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const loginBody = await login.json();

  assert.equal(login.status, 200);
  assert.equal(loginBody.access_token.split(".").length, 3);
  assert.match(login.headers.get("set-cookie"), /HttpOnly/);
  token = loginBody.access_token;

  const account = await fetch(`${baseUrl}/account/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const accountBody = await account.json();

  assert.equal(account.status, 200);
  assert.equal(accountBody.username, "admin");
  assert.equal(accountBody.is_system_admin, true);
});

test("rejects invalid credentials and missing authentication", async () => {
  const login = await fetch(`${baseUrl}/auth/login`, {
    body: JSON.stringify({
      identifier: "09123456789",
      password: "incorrect",
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const users = await fetch(`${baseUrl}/users`);

  assert.equal(login.status, 400);
  assert.equal(users.status, 401);
});

test("does not let error simulation bypass authentication", async () => {
  const response = await fetch(`${baseUrl}/users?mock_status=403`);

  assert.equal(response.status, 401);
});

test("serves parameterized routes and saved error examples", async () => {
  const details = await fetch(`${baseUrl}/users/example-id`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const conflict = await fetch(`${baseUrl}/roles/example-id?mock_status=409`, {
    headers: { Authorization: `Bearer ${token}` },
    method: "DELETE",
  });

  assert.equal(details.status, 200);
  assert.equal(conflict.status, 409);
  assert.ok((await conflict.json()).message);
});

test("filters and paginates user examples", async () => {
  const response = await fetch(`${baseUrl}/users?name=سارا&offset=0&size=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.items.length, 1);
  assert.equal(body.total, 1);
});
