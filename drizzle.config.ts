import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:server/data/kernel.sqlite",
  },
  dialect: "sqlite",
  out: "server/drizzle",
  schema: "server/src/db/schema.ts",
});
