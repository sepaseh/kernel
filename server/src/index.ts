import { once } from "node:events";

import { serve } from "@hono/node-server";

import { createApp } from "./app.ts";
import { createAuth } from "./auth.ts";
import { loadConfig, loadLoggingConfig } from "./config.ts";
import { createDatabase } from "./db/client.ts";
import { initializeDatabase } from "./db/initialize.ts";
import { flushAndExit, installFatalErrorHandlers } from "./lifecycle.ts";
import { createLogger } from "./logger.ts";
import { createObjectStorage } from "./storage/create.ts";
import { withStorageLogging } from "./storage/operations.ts";

let logger = createLogger({
  environment: "bootstrap",
  level: "info",
  pretty: false,
  release: "unknown",
});
let client: ReturnType<typeof createDatabase>["client"] | undefined;

try {
  logger = createLogger(loadLoggingConfig());
  installFatalErrorHandlers(logger);
  const config = loadConfig();
  const created = createDatabase(config);
  client = created.client;
  const { database } = created;
  const auth = createAuth(config, database, logger);
  const storage = createObjectStorage(config);

  await initializeDatabase(config, database, auth);
  await withStorageLogging(logger, config.storageDriver, "ensureReady", () =>
    storage.ensureReady(),
  );

  const app = createApp({ auth, config, database, logger, storage });
  const server = serve({
    fetch: app.fetch,
    hostname: config.host,
    port: config.port,
  });
  await once(server, "listening");
  logger.info(
    { event: "server.started", port: config.port },
    "Kernel API started",
  );

  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    const deadline = setTimeout(() => {
      logger.error(
        { event: "server.shutdown.failed", reason: "timeout" },
        "Shutdown timed out",
      );
      flushAndExit(logger, 1);
    }, 10_000);
    deadline.unref();
    server.close(async (error) => {
      try {
        if (error) throw error;
        await created.client.close();
        logger.info({ event: "server.stopped" }, "Kernel API stopped");
      } catch (error) {
        logger.error(
          { err: error, event: "server.shutdown.failed" },
          "Shutdown failed",
        );
        process.exitCode = 1;
      } finally {
        logger.flush(() => clearTimeout(deadline));
      }
    });
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
} catch (error) {
  logger.fatal(
    { err: error, event: "server.startup.failed" },
    "Kernel API startup failed",
  );
  try {
    await client?.close();
  } catch (cleanupError) {
    logger.error(
      { err: cleanupError, event: "server.shutdown.failed" },
      "Database cleanup failed",
    );
  }
  flushAndExit(logger, 1);
}
