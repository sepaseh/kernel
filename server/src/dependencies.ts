import type { Auth } from "./auth.ts";
import type { ServerConfig } from "./config.ts";
import type { Database } from "./db/client.ts";
import type { AppLogger } from "./logger.ts";
import type { ObjectStorage } from "./storage/contract.ts";

export type Dependencies = {
  auth: Auth;
  config: ServerConfig;
  database: Database;
  logger: AppLogger;
  storage: ObjectStorage;
};
