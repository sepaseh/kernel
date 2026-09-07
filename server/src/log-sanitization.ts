const REDACTED = "[Redacted]";
const MAX_DEPTH = 6;
const MAX_ENTRIES = 50;
const privateFields = new Set([
  "body",
  "bucket",
  "config",
  "connectionurl",
  "data",
  "dburi",
  "dburl",
  "destination",
  "email",
  "endpoint",
  "file",
  "filename",
  "headers",
  "identifier",
  "localstoragepath",
  "mobile",
  "objectkey",
  "originalname",
  "parameters",
  "params",
  "payload",
  "query",
  "session",
  "uri",
  "url",
  "valuehash",
]);

const sensitiveKey = (key: string) => {
  const normalized = key.replaceAll(/[^a-z0-9]/gi, "").toLowerCase();
  return (
    /authorization|cookie|password|passwd|secret|token|otp|apikey|accesskey|minio|database|connectionstring/.test(
      normalized,
    ) || privateFields.has(normalized)
  );
};

export const sanitizeLogText = (value: string) =>
  value
    .slice(0, 8_192)
    .replaceAll(/\b(?:Bearer|Basic)\s+[^\s,;]+/gi, REDACTED)
    .replaceAll(/\b[a-z][a-z0-9+.-]*:\/\/[^\s<>"')]+/gi, REDACTED)
    .replaceAll(/\bfile:[^\s<>"')]+/gi, REDACTED)
    .replaceAll(/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi, REDACTED)
    .replaceAll(/\b09\d{9}\b/g, REDACTED)
    .replaceAll(
      /((?:authorization|cookie|password|passwd|otp|token|secret|api[_-]?key|access[_-]?key|database[_-]?url)\s*[=:]\s*)(?:"[^"\r\n]*"|'[^'\r\n]*'|[^\s,;&]+)/gi,
      `$1${REDACTED}`,
    )
    .replaceAll(/[?&][^\s#]*/g, REDACTED)
    .replaceAll(/\p{Cc}/gu, " ")
    .slice(0, 2_048);

const errorTypes = new Set([
  "AggregateError",
  "ApiError",
  "APIError",
  "DrizzleError",
  "DrizzleQueryError",
  "Error",
  "RangeError",
  "ReferenceError",
  "S3Error",
  "SyntaxError",
  "TypeError",
]);

const errorCodes = new Set([
  "AccessDenied",
  "EACCES",
  "ECONNREFUSED",
  "ECONNRESET",
  "ENOENT",
  "ENOSPC",
  "ETIMEDOUT",
  "NoSuchBucket",
  "NoSuchKey",
  "SignatureDoesNotMatch",
  "SlowDown",
  "SQLITE_BUSY",
  "SQLITE_CONSTRAINT",
  "SQLITE_CONSTRAINT_UNIQUE",
  "SQLITE_ERROR",
]);

export const serializeLogError = (
  error: unknown,
  seen = new WeakSet<object>(),
  depth = 0,
): Record<string, unknown> => {
  if (!(error instanceof Error)) {
    return { message: "Non-Error value thrown", type: "NonError" };
  }
  if (seen.has(error) || depth >= MAX_DEPTH) {
    return { message: "Error chain truncated", type: "Error" };
  }
  seen.add(error);

  const type = errorTypes.has(error.name) ? error.name : "Error";
  // SDK messages can contain SQL parameters, credentials, or response bodies.
  // Keep only source locations from V8 frames, never the raw stack's first line.
  const frames = (error.stack ?? "")
    .slice(0, 65_536)
    .split(/\r?\n/)
    .filter((line) => /^\s+at /.test(line))
    .flatMap((line) => {
      const location = /[/\\]([\w.-]+\.(?:[cm]?js|tsx?):\d+:\d+)\)?$/.exec(
        line,
      );
      return location ? [`    at ${location[1]}`] : [];
    })
    .slice(0, 40);
  const code =
    "code" in error &&
    typeof error.code === "string" &&
    errorCodes.has(error.code)
      ? error.code
      : undefined;
  const result = {
    ...(error.cause !== undefined && {
      cause: serializeLogError(error.cause, seen, depth + 1),
    }),
    ...(code && { code }),
    ...(error instanceof AggregateError && {
      errors: error.errors
        .slice(0, MAX_ENTRIES)
        .map((item: unknown) => serializeLogError(item, seen, depth + 1)),
    }),
    message: "Error details withheld",
    ...(frames.length && {
      stack: `${type}: Error details withheld\n${frames.join("\n")}`,
    }),
    type,
  };
  return result;
};

const sanitizeValue = (
  value: unknown,
  seen: WeakSet<object>,
  depth: number,
): unknown => {
  if (value instanceof Error) return serializeLogError(value);
  if (typeof value === "string") return sanitizeLogText(value);
  if (typeof value === "bigint") return String(value);
  if (value === null || typeof value !== "object") {
    return typeof value === "function" || typeof value === "symbol"
      ? REDACTED
      : value;
  }
  if (seen.has(value) || depth >= MAX_DEPTH) return REDACTED;
  if (
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) !== Object.prototype &&
    Object.getPrototypeOf(value) !== null
  ) {
    return REDACTED;
  }
  seen.add(value);
  const result = Array.isArray(value)
    ? value
        .slice(0, MAX_ENTRIES)
        .map((item) => sanitizeValue(item, seen, depth + 1))
    : Object.fromEntries(
        Object.entries(Object.getOwnPropertyDescriptors(value))
          .slice(0, MAX_ENTRIES)
          .map(([key, descriptor]) => [
            key.slice(0, 128),
            sensitiveKey(key) || !("value" in descriptor)
              ? REDACTED
              : key === "err" || key === "error"
                ? serializeLogError(descriptor.value)
                : sanitizeValue(descriptor.value, seen, depth + 1),
          ]),
      );
  return result;
};

export const sanitizeLogFields = (
  fields: Record<string, unknown>,
): Record<string, unknown> =>
  sanitizeValue(fields, new WeakSet(), 0) as Record<string, unknown>;
