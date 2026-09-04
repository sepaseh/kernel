import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";

import { rolePermissions, roles, userRoles } from "../db/schema.ts";
import {
  getPermissionGroups,
  isPermissionKey,
  type PermissionKey,
} from "../domain.ts";
import type { AppEnvironment } from "../http.ts";
import {
  ApiError,
  authenticate,
  isUniqueConstraintError,
  parseJson,
  requiredString,
} from "../http.ts";

const parsePermissions = (value: unknown): PermissionKey[] => {
  if (!Array.isArray(value) || !value.every(isPermissionKey)) {
    throw new ApiError(400, "permissionsInvalid");
  }
  return [...new Set(value)];
};

const getRole = async (
  context: Parameters<typeof authenticate>[0],
  roleId: string,
) => {
  const database = context.get("dependencies").database;
  const role = await database.query.roles.findFirst({
    where: eq(roles.id, roleId),
  });
  if (!role) throw new ApiError(404, "roleNotFound");
  const permissions = await database
    .select({ permission: rolePermissions.permission })
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, roleId))
    .orderBy(asc(rolePermissions.permission));
  return {
    id: role.id,
    name: role.name,
    permissions: permissions
      .map(({ permission }) => permission)
      .filter(isPermissionKey),
  };
};

const replacePermissions = async (
  database: AppEnvironment["Variables"]["dependencies"]["database"],
  roleId: string,
  permissions: PermissionKey[],
) => {
  await database.transaction(async (transaction) => {
    await transaction
      .delete(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId));
    if (permissions.length) {
      await transaction
        .insert(rolePermissions)
        .values(permissions.map((permission) => ({ permission, roleId })));
    }
  });
};

export const createRoleRoutes = () => {
  const app = new Hono<AppEnvironment>();

  app.get("/permissions", async (context) => {
    await authenticate(context, { permission: "roles.read" });
    return context.json(getPermissionGroups(context.get("translate")));
  });

  app.get("/", async (context) => {
    await authenticate(context, { permission: "roles.read" });
    const database = context.get("dependencies").database;
    const values = await database.select().from(roles).orderBy(asc(roles.name));
    return context.json(
      await Promise.all(values.map((value) => getRole(context, value.id))),
    );
  });

  app.post("/", async (context) => {
    await authenticate(context, { permission: "roles.create" });
    const body = await parseJson(context);
    const name = requiredString(body.name, "name");
    const permissions = parsePermissions(body.permissions);
    const id = crypto.randomUUID();
    const database = context.get("dependencies").database;
    try {
      await database.insert(roles).values({ id, name });
      await replacePermissions(database, id, permissions);
      return context.json(await getRole(context, id), 201);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ApiError(400, "roleNameInUse");
      }
      throw error;
    }
  });

  app.get("/:roleId", async (context) => {
    await authenticate(context, { permission: "roles.read" });
    return context.json(await getRole(context, context.req.param("roleId")));
  });

  app.patch("/:roleId", async (context) => {
    await authenticate(context, { permission: "roles.update" });
    const roleId = context.req.param("roleId");
    await getRole(context, roleId);
    const body = await parseJson(context);
    const name = requiredString(body.name, "name");
    const permissions = parsePermissions(body.permissions);
    const database = context.get("dependencies").database;
    try {
      await database.update(roles).set({ name }).where(eq(roles.id, roleId));
      await replacePermissions(database, roleId, permissions);
      return context.json(await getRole(context, roleId));
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ApiError(400, "roleNameInUse");
      }
      throw error;
    }
  });

  app.delete("/:roleId", async (context) => {
    await authenticate(context, { permission: "roles.delete" });
    const roleId = context.req.param("roleId");
    await getRole(context, roleId);
    const assignment = await context
      .get("dependencies")
      .database.query.userRoles.findFirst({
        where: eq(userRoles.roleId, roleId),
      });
    if (assignment) throw new ApiError(409, "roleAssigned");
    await context
      .get("dependencies")
      .database.delete(roles)
      .where(eq(roles.id, roleId));
    return context.body(null, 200);
  });

  return app;
};
