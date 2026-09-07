import { AsyncLocalStorage } from "node:async_hooks";

import pino, { type DestinationStream, type Logger } from "pino";

import type { LoggingConfig } from "./config.ts";
import { sanitizeLogFields, sanitizeLogText } from "./log-sanitization.ts";

export type AppLogger = Pick<
  Logger,
  "child" | "debug" | "error" | "fatal" | "flush" | "info" | "warn"
>;

export const requestLogContext = new AsyncLocalStorage<{ logger: AppLogger }>();

export const createLogger = (
  config: LoggingConfig,
  destination?: DestinationStream,
): AppLogger => {
  const options: pino.LoggerOptions = {
    base: {
      environment: config.environment,
      release: config.release,
      service: "kernel-api",
    },
    formatters: {
      bindings: sanitizeLogFields,
      log: sanitizeLogFields,
    },
    hooks: {
      logMethod(args, method) {
        const [first, message] = args;
        const fields =
          first instanceof Error
            ? { err: first }
            : typeof first === "object" && first !== null
              ? first
              : {};
        const text =
          typeof first === "string"
            ? first
            : typeof message === "string"
              ? message
              : undefined;
        // Interpolated arguments are deliberately not formatted into free text.
        // An explicit fallback prevents Pino from copying err.message into msg.
        method.call(
          this,
          fields,
          text === undefined ? "Application event" : sanitizeLogText(text),
        );
      },
    },
    level: config.level,
    redact: {
      censor: "[Redacted]",
      paths: [
        "authorization",
        "cookie",
        "password",
        "otp",
        "token",
        "secret",
        "databaseUrl",
        "minio",
      ],
    },
    // formatters.log has already serialized and sanitized Error instances.
    serializers: { err: (value: unknown) => value },
    timestamp: pino.stdTimeFunctions.isoTime,
    ...(!destination &&
      config.pretty && {
        transport: {
          target: import.meta.resolve("pino-pretty"),
          options: { colorize: process.stdout.isTTY === true },
        },
      }),
  };
  return destination ? pino(options, destination) : pino(options);
};

export const createAuthLogger = (logger: AppLogger) => ({
  level: "debug" as const,
  log(
    level: "debug" | "info" | "warn" | "error",
    _message: string,
    ...args: unknown[]
  ) {
    const current = requestLogContext.getStore();
    const error = args.find((value) => value instanceof Error);
    (current?.logger ?? logger)[level](
      {
        component: "better-auth",
        ...(!current && error instanceof Error && { err: error }),
        event: "auth.diagnostic",
      },
      "Better Auth diagnostic",
    );
  },
});
