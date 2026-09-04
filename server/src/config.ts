import path from "node:path";
import { pathToFileURL } from "node:url";

export type ServerConfig = {
  allowedOrigin: string;
  authSecret: string;
  baseUrl: string;
  databaseUrl: string;
  host: string;
  localStoragePath: string;
  minio: {
    accessKey: string;
    bucket: string;
    endPoint: string;
    port: number;
    publicUrl: string;
    secretKey: string;
    useSSL: boolean;
  };
  otpCode: string;
  port: number;
  seedDevelopmentData: boolean;
  storageDriver: "local" | "minio";
  uploadLimitBytes: number;
};

const numberFromEnvironment = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const loadConfig = (
  environment: NodeJS.ProcessEnv = process.env,
): ServerConfig => {
  const storageDriver =
    environment.STORAGE_DRIVER === "minio" ||
    environment.STORAGE_DRIVER === "local"
      ? environment.STORAGE_DRIVER
      : environment.NODE_ENV === "production"
        ? "minio"
        : "local";
  if (environment.NODE_ENV === "production") {
    const required = [
      "BETTER_AUTH_SECRET",
      "BETTER_AUTH_URL",
      "DATABASE_URL",
      "SERVER_ALLOWED_ORIGIN",
    ];
    if (storageDriver === "minio") {
      required.push(
        "MINIO_ACCESS_KEY",
        "MINIO_ENDPOINT",
        "MINIO_PUBLIC_URL",
        "MINIO_SECRET_KEY",
      );
    }
    const missing = required.filter((name) => !environment[name]);
    if (missing.length) {
      throw new Error(
        `Missing required production configuration: ${missing.join(", ")}`,
      );
    }
  }
  const port = numberFromEnvironment(environment.PORT, 3000);
  const minioPort = numberFromEnvironment(environment.MINIO_PORT, 9000);
  const minioUseSSL = environment.MINIO_USE_SSL === "true";
  const minioEndpoint = environment.MINIO_ENDPOINT ?? "localhost";
  const minioProtocol = minioUseSSL ? "https" : "http";

  return {
    allowedOrigin: environment.SERVER_ALLOWED_ORIGIN ?? "http://localhost:5173",
    authSecret:
      environment.BETTER_AUTH_SECRET ??
      "kernel-local-development-secret-change-before-deployment",
    baseUrl: environment.BETTER_AUTH_URL ?? `http://localhost:${port}`,
    databaseUrl:
      environment.DATABASE_URL ??
      pathToFileURL(path.resolve("server", "data", "kernel.sqlite")).href,
    host: environment.HOST ?? "localhost",
    localStoragePath:
      environment.LOCAL_STORAGE_PATH ??
      path.resolve("server", "data", "uploads"),
    minio: {
      accessKey: environment.MINIO_ACCESS_KEY ?? "minioadmin",
      bucket: environment.MINIO_BUCKET ?? "kernel",
      endPoint: minioEndpoint,
      port: minioPort,
      publicUrl:
        environment.MINIO_PUBLIC_URL ??
        `${minioProtocol}://${minioEndpoint}:${minioPort}`,
      secretKey: environment.MINIO_SECRET_KEY ?? "minioadmin",
      useSSL: minioUseSSL,
    },
    otpCode: environment.OTP_FIXED_CODE ?? "123456",
    port,
    seedDevelopmentData:
      environment.NODE_ENV !== "production" &&
      environment.SERVER_SEED_DEVELOPMENT_DATA !== "false",
    storageDriver,
    uploadLimitBytes: numberFromEnvironment(
      environment.UPLOAD_LIMIT_BYTES,
      5 * 1024 * 1024,
    ),
  };
};
