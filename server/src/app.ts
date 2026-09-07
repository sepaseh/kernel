import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";

import type { Dependencies } from "./dependencies.ts";
import { type AppEnvironment, respondToError } from "./http.ts";
import { getTranslator } from "./i18n.ts";
import { requestLogging } from "./request-logging.ts";
import { createAccountRoutes } from "./routes/account.ts";
import { createAuthRoutes } from "./routes/auth.ts";
import { createCalendarRoutes } from "./routes/calendar.ts";
import { createFileRoutes } from "./routes/files.ts";
import { createRoleRoutes } from "./routes/roles.ts";
import {
  createLanguageRoutes,
  createSettingsRoutes,
} from "./routes/settings.ts";
import { createUserRoutes } from "./routes/users.ts";

export const createApp = (dependencies: Dependencies) => {
  const app = new Hono<AppEnvironment>();

  app.use("*", requestId({ limitLength: 128 }));
  app.use("*", requestLogging(dependencies.logger));
  app.use(
    "*",
    cors({
      allowHeaders: ["Authorization", "Content-Type", "X-Request-Id"],
      allowMethods: ["DELETE", "GET", "OPTIONS", "PATCH", "POST", "PUT"],
      credentials: true,
      exposeHeaders: ["X-Request-Id"],
      origin: dependencies.config.allowedOrigin,
    }),
  );
  app.use("*", async (context, next) => {
    context.set("dependencies", dependencies);
    context.set("translate", getTranslator("en"));
    const configured = await dependencies.database.query.settings.findFirst();
    context.set("translate", getTranslator(configured?.languageCode ?? "en"));
    await next();
  });

  app.get("/health", (context) => context.json({ status: "ok" }));
  app.route("/account", createAccountRoutes());
  app.route("/auth", createAuthRoutes());
  app.route("/calendar", createCalendarRoutes());
  app.route("/files", createFileRoutes());
  app.route("/languages", createLanguageRoutes());
  app.route("/roles", createRoleRoutes());
  app.route("/settings", createSettingsRoutes());
  app.route("/users", createUserRoutes());

  app.notFound((context) =>
    context.json({ message: context.get("translate")("notFound") }, 404),
  );
  app.onError(respondToError);

  return app;
};
