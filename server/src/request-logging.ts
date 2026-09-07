import { randomUUID } from "node:crypto";

import type { MiddlewareHandler } from "hono";
import { matchedRoutes } from "hono/route";

import { ApiError, type AppEnvironment, respondToError } from "./http.ts";
import { sanitizeLogText } from "./log-sanitization.ts";
import { type AppLogger, requestLogContext } from "./logger.ts";

export const requestLogging =
  (rootLogger: AppLogger): MiddlewareHandler<AppEnvironment> =>
  async (context, next) => {
    const started = performance.now();
    const suppliedId = context.get("requestId");
    const requestId =
      sanitizeLogText(suppliedId) === suppliedId ? suppliedId : randomUUID();
    context.set("requestId", requestId);
    const logger = rootLogger.child({ requestId });
    context.set("logger", logger);
    await requestLogContext.run({ logger }, async () => {
      try {
        await next();
      } catch (thrown) {
        // Hono handles Error instances internally, but non-Error throws escape.
        const error =
          thrown instanceof Error
            ? thrown
            : new Error("Non-Error value thrown", { cause: thrown });
        context.error = error;
        context.res = respondToError(error, context);
      }

      const error = context.error;
      const durationMs = Math.round((performance.now() - started) * 100) / 100;
      context.header("X-Request-Id", context.get("requestId"));
      const status = context.res.status;
      const current = context.get("logger");
      const method = context.req.method;
      const route = matchedRoutes(context).findLast(
        (value) => value.method !== "ALL",
      )?.path;
      const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
      const reason =
        error instanceof ApiError
          ? error.key
          : status >= 500
            ? "internalError"
            : undefined;
      // Route templates avoid retaining personal data in path parameters or 404 URLs.
      const fields = {
        method,
        path: route ?? "[unmatched]",
        ...(reason && { reason }),
        status,
      };
      if (
        method === "POST" &&
        context.req.path === "/auth/login" &&
        status >= 400
      ) {
        current[level](
          { ...fields, event: "auth.login.failed" },
          "Login failed",
        );
      }
      if (
        method === "POST" &&
        /^\/files\/?$/.test(context.req.path) &&
        status >= 400
      ) {
        current[level](
          {
            ...fields,
            event: "file.upload.failed",
            stage: context.get("uploadStage") ?? "authentication",
          },
          "File upload failed",
        );
      }
      current[level](
        {
          ...fields,
          durationMs,
          ...(status >= 500 && error && { err: error }),
          event: "api.request.completed",
        },
        "API request completed",
      );
    });
  };
