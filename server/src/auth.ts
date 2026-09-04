import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { bearer, username } from "better-auth/plugins";

import type { ServerConfig } from "./config.ts";
import type { Database } from "./db/client.ts";
import * as schema from "./db/schema.ts";

export const createAuth = (config: ServerConfig, database: Database) =>
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
