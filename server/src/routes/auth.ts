import { createHash, randomUUID } from "node:crypto";

import { and, desc, eq, isNull } from "drizzle-orm";
import type { Context } from "hono";
import { Hono } from "hono";

import { account, otpCodes, session, user } from "../db/schema.ts";
import { internalEmail } from "../domain.ts";
import type { AppEnvironment } from "../http.ts";
import {
  ApiError,
  authenticate,
  copyAuthHeaders,
  parseJson,
  requiredString,
} from "../http.ts";

const purposes = [
  "forgot_password",
  "login",
  "register",
  "verify_email",
] as const;

type OtpPurpose = (typeof purposes)[number];

const isOtpPurpose = (value: unknown): value is OtpPurpose =>
  typeof value === "string" && purposes.includes(value as OtpPurpose);

const isMobile = (value: string) => /^09\d{9}$/.test(value);

const otpHash = (
  secret: string,
  destination: string,
  purpose: string,
  value: string,
) =>
  createHash("sha256")
    .update(`${secret}:${destination}:${purpose}:${value}`)
    .digest("hex");

export const issueOtp = async (
  dependencies: AppEnvironment["Variables"]["dependencies"],
  destination: string,
  purpose: OtpPurpose,
) => {
  const now = new Date();
  const latest = await dependencies.database.query.otpCodes.findFirst({
    orderBy: [desc(otpCodes.createdAt)],
    where: and(
      eq(otpCodes.destination, destination),
      eq(otpCodes.purpose, purpose),
    ),
  });
  if (latest && latest.createdAt.getTime() + 120_000 > now.getTime()) {
    throw new ApiError(429, "otpThrottled");
  }
  const expiresAt = new Date(now.getTime() + 120_000);
  await dependencies.database.insert(otpCodes).values({
    createdAt: now,
    destination,
    expiresAt,
    id: randomUUID(),
    purpose,
    valueHash: otpHash(
      dependencies.config.authSecret,
      destination,
      purpose,
      dependencies.config.otpCode,
    ),
  });

  return { expires_in: 120, remaining_seconds: 120 };
};

export const consumeOtp = async (
  dependencies: AppEnvironment["Variables"]["dependencies"],
  destination: string,
  purpose: OtpPurpose,
  value: string,
) => {
  const record = await dependencies.database.query.otpCodes.findFirst({
    orderBy: [desc(otpCodes.createdAt)],
    where: and(
      eq(otpCodes.destination, destination),
      eq(otpCodes.purpose, purpose),
      isNull(otpCodes.consumedAt),
    ),
  });
  const expected = otpHash(
    dependencies.config.authSecret,
    destination,
    purpose,
    value,
  );
  if (
    !record ||
    record.expiresAt <= new Date() ||
    record.valueHash !== expected
  ) {
    throw new ApiError(400, "otpInvalid");
  }
  await dependencies.database
    .update(otpCodes)
    .set({ consumedAt: new Date() })
    .where(eq(otpCodes.id, record.id));
};

const accessTokenResponse = (
  context: Context<AppEnvironment>,
  headers: Headers,
  status: 200 | 201,
) => {
  const accessToken = headers.get("set-auth-token");
  if (!accessToken) throw new ApiError(500, "tokenNotIssued");
  copyAuthHeaders(context, headers);
  return context.json({ access_token: accessToken }, status);
};

export const createAuthRoutes = () => {
  const app = new Hono<AppEnvironment>();

  app.post("/login", async (context) => {
    const body = await parseJson(context);
    const identifier = requiredString(body.identifier, "identifier");
    const password = requiredString(body.password, "password");
    if (!isMobile(identifier)) throw new ApiError(400, "invalidCredentials");
    const dependencies = context.get("dependencies");
    const existingUser = await dependencies.database.query.user.findFirst({
      where: eq(user.mobile, identifier),
    });
    if (!existingUser || existingUser.status !== "active") {
      throw new ApiError(400, "invalidCredentials");
    }
    try {
      const result = await dependencies.auth.api.signInEmail({
        body: { email: existingUser.email, password },
        headers: context.req.raw.headers,
        returnHeaders: true,
      });
      return accessTokenResponse(context, result.headers, 200);
    } catch {
      throw new ApiError(400, "invalidCredentials");
    }
  });

  app.post("/register", async (context) => {
    const body = await parseJson(context);
    const firstName = requiredString(body.first_name, "first_name");
    const lastName = requiredString(body.last_name, "last_name");
    const mobile = requiredString(body.mobile, "mobile");
    const otp = requiredString(body.otp, "otp");
    const password = requiredString(body.password, "password");
    if (!isMobile(mobile)) throw new ApiError(400, "mobileInvalid");
    const dependencies = context.get("dependencies");
    await consumeOtp(dependencies, mobile, "register", otp);
    try {
      const result = await dependencies.auth.api.signUpEmail({
        body: {
          email: internalEmail(mobile),
          firstName,
          lastName,
          mobile,
          name: `${firstName} ${lastName}`,
          password,
        },
        headers: context.req.raw.headers,
        returnHeaders: true,
      });
      return accessTokenResponse(context, result.headers, 201);
    } catch {
      throw new ApiError(400, "registrationInvalid");
    }
  });

  app.post("/otp-request", async (context) => {
    const body = await parseJson(context);
    const mobile = requiredString(body.mobile, "mobile");
    if (!isMobile(mobile) || !isOtpPurpose(body.purpose)) {
      throw new ApiError(400, "invalidMobileOrPurpose");
    }

    return context.json(
      await issueOtp(context.get("dependencies"), mobile, body.purpose),
    );
  });

  app.post("/refresh-token", async (context) => {
    const { auth } = context.get("dependencies");
    const current = await auth.api.getSession({
      headers: context.req.raw.headers,
    });
    if (!current) throw new ApiError(401, "refreshInvalid");
    const token = current.session.token;
    return context.json({ access_token: token });
  });

  app.post("/logout", async (context) => {
    await authenticate(context);
    const { auth, database } = context.get("dependencies");
    const current = await auth.api.getSession({
      headers: context.req.raw.headers,
    });
    if (current) {
      await database.delete(session).where(eq(session.id, current.session.id));
    }
    context.header(
      "Set-Cookie",
      "better-auth.session_token=; HttpOnly; Max-Age=0; Path=/; SameSite=Lax",
    );
    return context.body(null, 200);
  });

  app.post("/change-password", async (context) => {
    await authenticate(context);
    const body = await parseJson(context);
    const currentPassword = requiredString(
      body.current_password,
      "current_password",
    );
    const newPassword = requiredString(body.new_password, "new_password");
    if (currentPassword === newPassword) {
      throw new ApiError(400, "newPasswordDifferent");
    }
    try {
      await context.get("dependencies").auth.api.changePassword({
        body: { currentPassword, newPassword },
        headers: context.req.raw.headers,
      });
    } catch {
      throw new ApiError(400, "passwordChangeInvalid");
    }
    return context.body(null, 200);
  });

  app.post("/forgot-password", async (context) => {
    const body = await parseJson(context);
    const mobile = requiredString(body.mobile, "mobile");
    const otp = requiredString(body.otp, "otp");
    const password = requiredString(body.password, "password");
    const dependencies = context.get("dependencies");
    await consumeOtp(dependencies, mobile, "forgot_password", otp);
    const existingUser = await dependencies.database.query.user.findFirst({
      where: eq(user.mobile, mobile),
    });
    if (!existingUser) throw new ApiError(400, "passwordResetInvalid");
    const { hashPassword } = await import("better-auth/crypto");
    const passwordHash = await hashPassword(password);
    const result = await dependencies.database
      .update(account)
      .set({ password: passwordHash, updatedAt: new Date() })
      .where(
        and(
          eq(account.userId, existingUser.id),
          eq(account.providerId, "credential"),
        ),
      )
      .returning({ id: account.id });
    if (result.length === 0) throw new ApiError(400, "passwordResetInvalid");
    return context.body(null, 200);
  });

  return app;
};
