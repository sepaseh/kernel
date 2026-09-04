import { serve } from "@hono/node-server";

import { createApp } from "./app.ts";
import { createAuth } from "./auth.ts";
import { loadConfig } from "./config.ts";
import { createDatabase } from "./db/client.ts";
import { initializeDatabase } from "./db/initialize.ts";
import { createObjectStorage } from "./storage/create.ts";

const config = loadConfig();
const { client, database } = createDatabase(config);
const auth = createAuth(config, database);
const storage = createObjectStorage(config);

await initializeDatabase(config, database, auth);
await storage.ensureReady();

const app = createApp({ auth, config, database, storage });
const server = serve({
  fetch: app.fetch,
  hostname: config.host,
  port: config.port,
});

console.log(`Kernel API is running at ${config.baseUrl}`);

const shutdown = () => {
  server.close(async (error) => {
    await client.close();
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
