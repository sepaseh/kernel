import { eq } from "drizzle-orm";
import type { Context } from "hono";

import { user } from "./db/schema.ts";
import type { Dependencies } from "./dependencies.ts";
import type { PermissionKey } from "./domain.ts";
import { getUserPermissions } from "./domain.ts";
import type { TranslationKey, Translator } from "./i18n.ts";

export type AppEnvironment = {
  Variables: {
    dependencies: Dependencies;
    translate: Translator;
  };
};

type ErrorStatus = 400 | 401 | 403 | 404 | 409 | 413 | 429 | 500;

export class ApiError extends Error {
  readonly key: TranslationKey;
  readonly status: ErrorStatus;
  readonly values?: Record<string, string | number>;

  constructor(
    status: ErrorStatus,
    key: TranslationKey,
    values?: Record<string, string | number>,
  ) {
    super(key);
    this.key = key;
    this.status = status;
    this.values = values;
  }
}

export const parseJson = async (context: Context<AppEnvironment>) => {
  try {
    const value: unknown = await context.req.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new ApiError(400, "jsonObjectRequired");
    }

    return value as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "invalidJson");
  }
};

const optionalString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

export const requiredString = (value: unknown, name: string) => {
  const result = optionalString(value);
  if (!result) throw new ApiError(400, "fieldRequired", { field: name });
  return result;
};

export const copyAuthHeaders = (
  context: Context<AppEnvironment>,
  headers: Headers,
) => {
  for (const cookie of headers.getSetCookie()) {
    context.header("Set-Cookie", cookie, { append: true });
  }
};

export const authenticate = async (
  context: Context<AppEnvironment>,
  options: { permission?: PermissionKey; systemAdmin?: boolean } = {},
) => {
  const { auth, database } = context.get("dependencies");
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });
  if (!session) throw new ApiError(401, "authenticationRequired");
  const account = await database.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });
  if (!account || account.status !== "active") {
    throw new ApiError(401, "authenticationRequired");
  }
  if (options.systemAdmin && !account.isSystemAdmin) {
    throw new ApiError(403, "systemAdminRequired");
  }
  if (options.permission && !account.isSystemAdmin) {
    const permissions = await getUserPermissions(database, account.id);
    if (!permissions.includes(options.permission)) {
      throw new ApiError(403, "permissionDenied");
    }
  }

  return { account, session };
};

export const isUniqueConstraintError = (error: unknown) =>
  error instanceof Error &&
  (("code" in error && error.code === "SQLITE_CONSTRAINT_UNIQUE") ||
    /unique constraint/i.test(error.message));
