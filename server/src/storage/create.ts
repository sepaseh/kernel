import type { ServerConfig } from "../config.ts";
import type { ObjectStorage } from "./contract.ts";
import { LocalFileStorage } from "./local.ts";
import { MinioObjectStorage } from "./minio.ts";

export const createObjectStorage = (config: ServerConfig): ObjectStorage =>
  config.storageDriver === "minio"
    ? new MinioObjectStorage(config.minio)
    : new LocalFileStorage(config);
