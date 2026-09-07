import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { bearer, username } from "better-auth/plugins";

import type { ServerConfig } from "./config.ts";
import type { Database } from "./db/client.ts";
import * as schema from "./db/schema.ts";
import { type AppLogger, createAuthLogger } from "./logger.ts";

export const createAuth = (
  config: ServerConfig,
  database: Database,
  logger: AppLogger,
) =>
  betterAuth({
    basePath: "/__auth",
    baseURL: config.baseUrl,
    database: drizzleAdapter(database, {
      provider: "sqlite",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    logger: createAuthLogger(logger),
    plugins: [bearer(), username()],
    secret: config.authSecret,
    trustedOrigins: [config.allowedOrigin],
    user: {
      additionalFields: {
        firstName: { required: true, type: "string" },
        isSystemAdmin: {
          defaultValue: false,
          input: false,
          required: true,
          type: "boolean",
        },
        lastName: { required: true, type: "string" },
        mobile: { required: true, type: "string" },
        status: {
          defaultValue: "active",
          input: false,
          required: true,
          type: ["active", "inactive"],
        },
      },
    },
  });

export type Auth = ReturnType<typeof createAuth>;
