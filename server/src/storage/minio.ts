import { Client } from "minio";

import type { ServerConfig } from "../config.ts";
import type { ObjectStorage } from "./contract.ts";
import { publicObjectUrl } from "./contract.ts";

const publicReadPolicy = (bucket: string) =>
  JSON.stringify({
    Statement: [
      {
        Action: ["s3:GetObject"],
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Resource: [`arn:aws:s3:::${bucket}/*`],
        Sid: "PublicRead",
      },
    ],
    Version: "2012-10-17",
  });

const isLoopbackEndpoint = (endpoint: string) =>
  endpoint === "localhost" ||
  endpoint === "::1" ||
  endpoint === "[::1]" ||
  /^127(?:\.\d{1,3}){3}$/.test(endpoint);

export class MinioObjectStorage implements ObjectStorage {
  readonly #client: Client;
  readonly #privateBucket: string;
  readonly #publicBucket: string;
  readonly #publicUrl: string;

  constructor(config: ServerConfig["minio"]) {
    if (!config.useSSL && !isLoopbackEndpoint(config.endPoint)) {
      throw new Error("TLS is required for non-loopback MinIO endpoints.");
    }
    this.#client = new Client({
      accessKey: config.accessKey,
      endPoint: config.endPoint,
      port: config.port,
      secretKey: config.secretKey,
      useSSL: config.useSSL,
    });
    this.#privateBucket = `${config.bucket}-private`;
    this.#publicBucket = `${config.bucket}-public`;
    this.#publicUrl = config.publicUrl.replace(/\/$/, "");
  }

  async delete(bucket: string, objectKey: string) {
    await this.#client.removeObject(bucket, objectKey);
  }

  async ensureReady() {
    for (const bucket of [this.#privateBucket, this.#publicBucket]) {
      if (!(await this.#client.bucketExists(bucket))) {
        await this.#client.makeBucket(bucket);
      }
    }
    await this.#client.setBucketPolicy(
      this.#publicBucket,
      publicReadPolicy(this.#publicBucket),
    );
  }

  async get(bucket: string, objectKey: string) {
    const stream = await this.#client.getObject(bucket, objectKey);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks);
  }

  async put(input: {
    contentType: string;
    data: Uint8Array;
    objectKey: string;
    visibility: "private" | "public";
  }) {
    const bucket =
      input.visibility === "public" ? this.#publicBucket : this.#privateBucket;
    await this.#client.putObject(
      bucket,
      input.objectKey,
      Buffer.from(input.data),
      input.data.byteLength,
      { "Content-Type": input.contentType },
    );
    return { bucket, objectKey: input.objectKey };
  }

  url(bucket: string, objectKey: string, visibility: string) {
    return visibility === "public"
      ? publicObjectUrl(this.#publicUrl, bucket, objectKey)
      : undefined;
  }
}
