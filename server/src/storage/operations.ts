import type { ServerConfig } from "../config.ts";
import type { AppLogger } from "../logger.ts";

export const withStorageLogging = async <T>(
  logger: AppLogger,
  driver: ServerConfig["storageDriver"],
  operation: "delete" | "ensureReady" | "get" | "put",
  run: () => Promise<T>,
): Promise<T> => {
  try {
    return await run();
  } catch (error) {
    logger.error(
      { event: "storage.operation.failed", operation, storageDriver: driver },
      "Storage operation failed",
    );
    throw error;
  }
};
