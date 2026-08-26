const http = require("node:http");

const { loadRoutes, readExample } = require("./collection.cjs");
const { findUser, fullPermissions, publicUser, users } = require("./data.cjs");
const { signToken, verifyToken } = require("./jwt.cjs");

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT) || 3000;

const setCorsHeaders = (request, response) => {
  const origin = request.headers.origin;
  if (origin) {
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type, X-Mock-Status",
  );
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
};

const sendJson = (response, status, body, headers = {}) => {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers,
  });
  response.end(JSON.stringify(body, null, 2));
};

const readRequestBody = async (request) => {
  if (!["POST", "PUT", "PATCH"].includes(request.method)) return null;
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return null;
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
};

const tokenClaims = (request) => {
  const [scheme, token] = (request.headers.authorization || "").split(" ");
  return scheme?.toLowerCase() === "bearer" && token
    ? verifyToken(token)
    : null;
};

const paginateUsers = (body, searchParams) => {
  if (!body || !Array.isArray(body.items)) return body;
  const includes = (value, key) => {
    const filter = searchParams.get(key)?.trim().toLocaleLowerCase();
    return (
      !filter ||
      String(value ?? "")
        .toLocaleLowerCase()
        .includes(filter)
    );
  };
  const status = searchParams.get("status")?.trim();
  const filtered = body.items.filter(
    (user) =>
      includes(`${user.first_name} ${user.last_name}`, "name") &&
      includes(user.email, "email") &&
      includes(user.mobile, "mobile") &&
      includes(user.username, "username") &&
      (!status || user.status === status),
  );
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const size = Math.max(1, Number(searchParams.get("size")) || 12);
  return {
    ...body,
    items: filtered.slice(offset, offset + size),
    total: filtered.length,
  };
};

const createServer = (routes = loadRoutes()) =>
  http.createServer(async (request, response) => {
    setCorsHeaders(request, response);
    if (request.method === "OPTIONS") {
      response.writeHead(204);
      return response.end();
    }

    const url = new URL(request.url, "http://localhost");
    if (request.method === "GET" && url.pathname === "/__mock/health") {
      return sendJson(response, 200, {
        route_count: routes.length,
        status: "ok",
      });
    }
    if (request.method === "GET" && url.pathname === "/__mock/routes") {
      return sendJson(
        response,
        200,
        routes.map(({ method, path, requiresAuth, successStatus }) => ({
          method,
          path,
          requires_auth: requiresAuth,
          status: successStatus,
        })),
      );
    }

    const route = routes.find(
      (candidate) =>
        candidate.method === request.method &&
        candidate.pattern.test(url.pathname),
    );
    if (!route) {
      return sendJson(response, 404, {
        message: `No mock is defined for ${request.method} ${url.pathname}`,
      });
    }

    const requestedStatus = Number(
      url.searchParams.get("mock_status") || request.headers["x-mock-status"],
    );
    const status =
      requestedStatus >= 400 ? requestedStatus : route.successStatus;
    const example = readExample(route, status);
    const claims = tokenClaims(request);

    if (!requestedStatus && route.requiresAuth && !claims) {
      return sendJson(
        response,
        401,
        readExample(route, 401)?.body || {
          message: "Authentication required.",
        },
      );
    }
    if (!requestedStatus && route.systemAdminOnly && !claims.is_system_admin) {
      return sendJson(
        response,
        403,
        readExample(route, 403)?.body || {
          message: "System administrator required.",
        },
      );
    }
    if (status >= 400 && !example) {
      return sendJson(response, status, {
        message: `Simulated ${status} error for ${route.method} ${route.path}`,
      });
    }
    if (!example) {
      response.writeHead(status);
      return response.end();
    }

    const requestBody = await readRequestBody(request);
    let authenticatedUser;
    if (status < 300 && route.path === "/auth/login") {
      authenticatedUser = findUser(requestBody?.identifier);
      if (
        !authenticatedUser ||
        authenticatedUser.password !== requestBody?.password
      ) {
        return sendJson(
          response,
          400,
          readExample(route, 400)?.body || { message: "Invalid credentials." },
        );
      }
    }

    let body = structuredClone(example.body);
    if (status < 300 && route.path === "/account/me") {
      const account = users.find((user) => user.id === claims.sub);
      if (account) body = publicUser(account);
    }
    if (status < 300 && route.method === "GET" && route.path === "/users") {
      body = paginateUsers(body, url.searchParams);
    }
    if (
      status < 300 &&
      ["/auth/login", "/auth/refresh-token", "/auth/register"].includes(
        route.path,
      )
    ) {
      const account = authenticatedUser || users[0];
      body = {
        ...body,
        access_token: signToken({
          is_system_admin: account.is_system_admin,
          permissions: account.is_system_admin ? ["*"] : fullPermissions,
          sub: account.id,
          username: account.username,
        }),
      };
      response.setHeader(
        "Set-Cookie",
        "kernel_refresh=local; HttpOnly; Path=/auth; SameSite=Lax",
      );
    }

    return sendJson(response, status, body, {
      "X-Mock-Response": example.source,
    });
  });

if (require.main === module) {
  const routes = loadRoutes();
  createServer(routes).listen(port, host, () => {
    console.log(`Kernel mock API is running at http://${host}:${port}`);
    console.log(`Loaded ${routes.length} routes from the Bruno collection.`);
  });
}

module.exports = { createServer };
