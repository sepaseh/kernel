import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import type { ServerConfig } from "../config.ts";
import * as schema from "./schema.ts";

export const createDatabase = (config: ServerConfig) => {
  if (config.databaseUrl.startsWith("file:")) {
    const databasePath = config.databaseUrl.startsWith("file://")
      ? fileURLToPath(config.databaseUrl)
      : path.resolve(config.databaseUrl.slice("file:".length));
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  }
  const client = createClient({ url: config.databaseUrl });
  const database = drizzle(client, { schema });

  return { client, database };
};

export type Database = ReturnType<typeof createDatabase>["database"];
