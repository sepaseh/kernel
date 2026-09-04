import { and, asc, count, eq, like, or } from "drizzle-orm";
import { Hono } from "hono";

import { account, roles, session, user, userRoles } from "../db/schema.ts";
import { getRolesByUserIds, internalEmail, serializeUser } from "../domain.ts";
import type { AppEnvironment } from "../http.ts";
import {
  ApiError,
  authenticate,
  isUniqueConstraintError,
  parseJson,
  requiredString,
} from "../http.ts";

const findUser = async (
  context: Parameters<typeof authenticate>[0],
  userId: string,
) => {
  const result = await context
    .get("dependencies")
    .database.query.user.findFirst({
      where: eq(user.id, userId),
    });
  if (!result) throw new ApiError(404, "userNotFound");
  return result;
};

const parsePagination = (value: string | undefined, fallback: number) => {
  if (!value || !/^\d+$/.test(value)) return fallback;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : fallback;
};

export const createUserRoutes = () => {
  const app = new Hono<AppEnvironment>();

  app.get("/", async (context) => {
    await authenticate(context, { permission: "users.read" });
    const database = context.get("dependencies").database;
    const query = context.req.query();
    const conditions = [];
    if (query.email) conditions.push(eq(user.profileEmail, query.email));
    if (query.mobile) conditions.push(eq(user.mobile, query.mobile));
    if (query.username) conditions.push(eq(user.username, query.username));
    if (query.first_name) {
      conditions.push(like(user.firstName, `%${query.first_name}%`));
    }
    if (query.last_name) {
      conditions.push(like(user.lastName, `%${query.last_name}%`));
    }
    if (query.status === "active" || query.status === "inactive") {
      conditions.push(eq(user.status, query.status));
    }
    const offset = parsePagination(query.offset, 0);
    const requestedSize = parsePagination(query.size, 12);
    const size = requestedSize > 0 ? requestedSize : 12;
    const where = conditions.length ? and(...conditions) : undefined;
    const [page, totals] = await Promise.all([
      database
        .select()
        .from(user)
        .where(where)
        .orderBy(asc(user.createdAt))
        .limit(size)
        .offset(offset),
      database.select({ total: count() }).from(user).where(where),
    ]);
    const rolesByUser = await getRolesByUserIds(
      database,
      page.map(({ id }) => id),
    );
    return context.json({
      items: page.map((value) =>
        serializeUser(value, rolesByUser.get(value.id) ?? []),
      ),
      total: totals[0]?.total ?? 0,
    });
  });

  app.post("/", async (context) => {
    await authenticate(context, { permission: "users.create" });
    const body = await parseJson(context);
    const firstName = requiredString(body.first_name, "first_name");
    const lastName = requiredString(body.last_name, "last_name");
    const mobile = requiredString(body.mobile, "mobile");
    const password = requiredString(body.password, "password");
    if (!/^09\d{9}$/.test(mobile)) throw new ApiError(400, "mobileInvalid");
    const dependencies = context.get("dependencies");
    try {
      const created = await dependencies.auth.api.signUpEmail({
        body: {
          email: internalEmail(mobile),
          firstName,
          lastName,
          mobile,
          name: `${firstName} ${lastName}`,
          password,
        },
      });
      await dependencies.database
        .delete(session)
        .where(eq(session.userId, created.user.id));
      const record = await findUser(context, created.user.id);
      return context.json(serializeUser(record), 201);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, "userDataInvalid");
    }
  });

  app.get("/:userId", async (context) => {
    await authenticate(context, { permission: "users.read" });
    const record = await findUser(context, context.req.param("userId"));
    const database = context.get("dependencies").database;
    const rolesByUser = await getRolesByUserIds(database, [record.id]);
    return context.json(
      serializeUser(record, rolesByUser.get(record.id) ?? []),
    );
  });

  app.patch("/:userId", async (context) => {
    await authenticate(context, { permission: "users.update" });
    const existing = await findUser(context, context.req.param("userId"));
    const body = await parseJson(context);
    const updates: Partial<
      Pick<typeof user.$inferInsert, "firstName" | "lastName" | "mobile">
    > = {};
    if (typeof body.first_name === "string" && body.first_name.trim()) {
      updates.firstName = body.first_name.trim();
    }
    if (typeof body.last_name === "string" && body.last_name.trim()) {
      updates.lastName = body.last_name.trim();
    }
    if (typeof body.mobile === "string" && /^09\d{9}$/.test(body.mobile)) {
      updates.mobile = body.mobile;
    }
    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, "updateFieldsRequired");
    }
    const database = context.get("dependencies").database;
    try {
      const [updated] = await database
        .update(user)
        .set({
          ...updates,
          name: `${updates.firstName ?? existing.firstName} ${updates.lastName ?? existing.lastName}`,
          updatedAt: new Date(),
        })
        .where(eq(user.id, existing.id))
        .returning();
      const rolesByUser = await getRolesByUserIds(database, [existing.id]);
      return context.json(
        serializeUser(updated, rolesByUser.get(existing.id) ?? []),
      );
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ApiError(400, "mobileInUse");
      }
      throw error;
    }
  });

  app.delete("/:userId", async (context) => {
    const { account: actor } = await authenticate(context, {
      permission: "users.delete",
    });
    const existing = await findUser(context, context.req.param("userId"));
    if (existing.id === actor.id) {
      throw new ApiError(409, "userCannotDeleteSelf");
    }
    const database = context.get("dependencies").database;
    await database.transaction(async (transaction) => {
      if (existing.isSystemAdmin && existing.status === "active") {
        const [result] = await transaction
          .select({ total: count() })
          .from(user)
          .where(and(eq(user.isSystemAdmin, true), eq(user.status, "active")));
        if ((result?.total ?? 0) <= 1) {
          throw new ApiError(409, "finalAdminDelete");
        }
      }
      await transaction.delete(user).where(eq(user.id, existing.id));
    });
    return context.body(null, 200);
  });

  app.patch("/:userId/status", async (context) => {
    const { account: actor } = await authenticate(context, {
      permission: "users.update",
    });
    const existing = await findUser(context, context.req.param("userId"));
    const body = await parseJson(context);
    if (body.status !== "active" && body.status !== "inactive") {
      throw new ApiError(400, "userStatusInvalid");
    }
    const status = body.status;
    if (existing.id === actor.id && status === "inactive") {
      throw new ApiError(409, "userCannotDeactivateSelf");
    }
    const database = context.get("dependencies").database;
    await database.transaction(async (transaction) => {
      if (
        existing.isSystemAdmin &&
        existing.status === "active" &&
        status === "inactive"
      ) {
        const [result] = await transaction
          .select({ total: count() })
          .from(user)
          .where(and(eq(user.isSystemAdmin, true), eq(user.status, "active")));
        if ((result?.total ?? 0) <= 1) {
          throw new ApiError(409, "finalAdminDelete");
        }
      }
      await transaction
        .update(user)
        .set({ status, updatedAt: new Date() })
        .where(eq(user.id, existing.id));
    });
    return context.body(null, 200);
  });

  app.put("/:userId/roles", async (context) => {
    await authenticate(context, { permission: "users.update" });
    const existing = await findUser(context, context.req.param("userId"));
    const body = await parseJson(context);
    if (
      !Array.isArray(body.role_ids) ||
      !body.role_ids.every((id) => typeof id === "string")
    ) {
      throw new ApiError(400, "userRolesInvalid");
    }
    const roleIds = [...new Set(body.role_ids)];
    const database = context.get("dependencies").database;
    if (roleIds.length) {
      const found = await database
        .select({ id: roles.id })
        .from(roles)
        .where(or(...roleIds.map((id) => eq(roles.id, id))));
      if (found.length !== roleIds.length)
        throw new ApiError(404, "roleNotFound");
    }
    await database.transaction(async (transaction) => {
      await transaction
        .delete(userRoles)
        .where(eq(userRoles.userId, existing.id));
      if (roleIds.length) {
        await transaction
          .insert(userRoles)
          .values(roleIds.map((roleId) => ({ roleId, userId: existing.id })));
      }
    });
    return context.body(null, 200);
  });

  app.patch("/:userId/system-admin", async (context) => {
    await authenticate(context, { systemAdmin: true });
    const existing = await findUser(context, context.req.param("userId"));
    const body = await parseJson(context);
    if (typeof body.is_system_admin !== "boolean") {
      throw new ApiError(400, "systemAdminInvalid");
    }
    const isSystemAdmin = body.is_system_admin;
    const database = context.get("dependencies").database;
    await database.transaction(async (transaction) => {
      if (
        existing.isSystemAdmin &&
        existing.status === "active" &&
        !isSystemAdmin
      ) {
        const [result] = await transaction
          .select({ total: count() })
          .from(user)
          .where(and(eq(user.isSystemAdmin, true), eq(user.status, "active")));
        if ((result?.total ?? 0) <= 1) {
          throw new ApiError(409, "finalAdminDelete");
        }
      }
      await transaction
        .update(user)
        .set({ isSystemAdmin, updatedAt: new Date() })
        .where(eq(user.id, existing.id));
    });
    return context.body(null, 200);
  });

  app.put("/:userId/password", async (context) => {
    await authenticate(context, { systemAdmin: true });
    const existing = await findUser(context, context.req.param("userId"));
    const body = await parseJson(context);
    const password = requiredString(body.password, "password");
    if (password.length < 8) throw new ApiError(400, "passwordTooShort");
    const { hashPassword } = await import("better-auth/crypto");
    const passwordHash = await hashPassword(password);
    const database = context.get("dependencies").database;
    const updated = await database
      .update(account)
      .set({ password: passwordHash, updatedAt: new Date() })
      .where(
        and(
          eq(account.userId, existing.id),
          eq(account.providerId, "credential"),
        ),
      )
      .returning({ id: account.id });
    if (!updated.length) throw new ApiError(404, "credentialAccountNotFound");
    await database.delete(session).where(eq(session.userId, existing.id));
    return context.body(null, 200);
  });

  return app;
};
