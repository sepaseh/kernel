import { and, eq, ne } from "drizzle-orm";
import { Hono } from "hono";

import { user } from "../db/schema.ts";
import { serializeAccount } from "../domain.ts";
import type { AppEnvironment } from "../http.ts";
import {
  ApiError,
  authenticate,
  isUniqueConstraintError,
  parseJson,
  requiredString,
} from "../http.ts";
import { consumeOtp, issueOtp } from "./auth.ts";

export const createAccountRoutes = () => {
  const app = new Hono<AppEnvironment>();

  app.get("/me", async (context) => {
    const { account } = await authenticate(context);
    return context.json(
      await serializeAccount(context.get("dependencies").database, account),
    );
  });

  app.patch("/update-profile", async (context) => {
    const { account } = await authenticate(context);
    const body = await parseJson(context);
    const firstName =
      typeof body.first_name === "string" && body.first_name.trim()
        ? body.first_name.trim()
        : undefined;
    const lastName =
      typeof body.last_name === "string" && body.last_name.trim()
        ? body.last_name.trim()
        : undefined;
    if (!firstName && !lastName) {
      throw new ApiError(400, "profileFieldsRequired");
    }
    const database = context.get("dependencies").database;
    const [updated] = await database
      .update(user)
      .set({
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        name: `${firstName ?? account.firstName} ${lastName ?? account.lastName}`,
        updatedAt: new Date(),
      })
      .where(eq(user.id, account.id))
      .returning();
    return context.json(await serializeAccount(database, updated));
  });

  app.post("/update-username", async (context) => {
    const { account } = await authenticate(context);
    const body = await parseJson(context);
    const username = requiredString(body.username, "username").toLowerCase();
    if (!/^[a-z0-9_.-]{3,30}$/.test(username)) {
      throw new ApiError(400, "usernameInvalid");
    }
    const database = context.get("dependencies").database;
    const duplicate = await database.query.user.findFirst({
      where: and(eq(user.username, username), ne(user.id, account.id)),
    });
    if (duplicate) throw new ApiError(400, "usernameInUse");
    try {
      const [updated] = await database
        .update(user)
        .set({ displayUsername: username, updatedAt: new Date(), username })
        .where(eq(user.id, account.id))
        .returning();
      return context.json(await serializeAccount(database, updated));
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ApiError(400, "usernameInUse");
      }
      throw error;
    }
  });

  app.post("/request-email-verification", async (context) => {
    const { account } = await authenticate(context);
    const body = await parseJson(context);
    const email = requiredString(body.email, "email").toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new ApiError(400, "emailInvalid");
    }
    return context.json(
      await issueOtp(
        context.get("dependencies"),
        email,
        "verify_email",
        account.id,
      ),
    );
  });

  app.post("/verify-email", async (context) => {
    const { account } = await authenticate(context);
    const body = await parseJson(context);
    const email = requiredString(body.email, "email").toLowerCase();
    const otp = requiredString(body.otp, "otp");
    const dependencies = context.get("dependencies");
    await consumeOtp(dependencies, email, "verify_email", otp, account.id);
    try {
      await dependencies.database
        .update(user)
        .set({ profileEmail: email, updatedAt: new Date() })
        .where(eq(user.id, account.id));
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ApiError(400, "emailInUse");
      }
      throw error;
    }
    return context.body(null, 200);
  });

  return app;
};
