import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ServerConfig } from "../config.ts";
import type { ObjectStorage } from "./contract.ts";

const buckets = {
  private: "local-private",
  public: "local-public",
} as const;

export class LocalFileStorage implements ObjectStorage {
  readonly #baseUrl: string;
  readonly #root: string;

  constructor(config: Pick<ServerConfig, "baseUrl" | "localStoragePath">) {
    this.#baseUrl = config.baseUrl.replace(/\/$/, "");
    this.#root = path.resolve(config.localStoragePath);
  }

  async ensureReady() {
    await Promise.all(
      Object.values(buckets).map((bucket) =>
        mkdir(path.join(this.#root, bucket), { recursive: true }),
      ),
    );
  }

  async get(bucket: string, objectKey: string) {
    return readFile(this.#resolve(bucket, objectKey));
  }

  async put(input: {
    contentType: string;
    data: Uint8Array;
    objectKey: string;
    visibility: "private" | "public";
  }) {
    const bucket = buckets[input.visibility];
    const target = this.#resolve(bucket, input.objectKey);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, input.data, { flag: "wx" });
    return { bucket, objectKey: input.objectKey };
  }

  url(_bucket: string, objectKey: string, visibility: string) {
    if (visibility !== "public") return undefined;
    const fileId = objectKey.split("/", 1)[0];
    return fileId
      ? `${this.#baseUrl}/files/${encodeURIComponent(fileId)}/content`
      : undefined;
  }

  #resolve(bucket: string, objectKey: string) {
    if (
      !Object.values(buckets).includes(
        bucket as (typeof buckets)[keyof typeof buckets],
      )
    ) {
      throw new Error("Invalid local storage bucket.");
    }
    const bucketRoot = path.resolve(this.#root, bucket);
    const target = path.resolve(bucketRoot, objectKey);
    if (!target.startsWith(`${bucketRoot}${path.sep}`)) {
      throw new Error("Invalid local storage object key.");
    }
    return target;
  }
}
