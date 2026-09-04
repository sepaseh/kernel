import { asc, eq, inArray } from "drizzle-orm";

import type { Database } from "./db/client.ts";
import type { user } from "./db/schema.ts";
import { rolePermissions, roles, userRoles } from "./db/schema.ts";
import type { TranslationKey, Translator } from "./i18n.ts";

export const permissionKeys = [
  "calendar.read",
  "calendar.update",
  "roles.create",
  "roles.delete",
  "roles.read",
  "roles.update",
  "settings.update",
  "users.create",
  "users.delete",
  "users.read",
  "users.update",
] as const;

export type PermissionKey = (typeof permissionKeys)[number];

const permissionGroupDefinitions = [
  {
    name: "calendar",
    permissions: [
      { name: "calendar.read", titleKey: "permissionCalendarRead" },
      { name: "calendar.update", titleKey: "permissionCalendarUpdate" },
    ],
    titleKey: "permissionCalendar",
  },
  {
    name: "roles",
    permissions: [
      { name: "roles.create", titleKey: "permissionRolesCreate" },
      { name: "roles.delete", titleKey: "permissionRolesDelete" },
      { name: "roles.read", titleKey: "permissionRolesRead" },
      { name: "roles.update", titleKey: "permissionRolesUpdate" },
    ],
    titleKey: "permissionRoles",
  },
  {
    name: "settings",
    permissions: [
      { name: "settings.update", titleKey: "permissionSettingsUpdate" },
    ],
    titleKey: "permissionSettings",
  },
  {
    name: "users",
    permissions: [
      { name: "users.create", titleKey: "permissionUsersCreate" },
      { name: "users.delete", titleKey: "permissionUsersDelete" },
      { name: "users.read", titleKey: "permissionUsersRead" },
      { name: "users.update", titleKey: "permissionUsersUpdate" },
    ],
    titleKey: "permissionUsers",
  },
] satisfies Array<{
  name: string;
  permissions: Array<{ name: PermissionKey; titleKey: TranslationKey }>;
  titleKey: TranslationKey;
}>;

export const getPermissionGroups = (translate: Translator) =>
  permissionGroupDefinitions.map(({ name, permissions, titleKey }) => ({
    name,
    permissions: permissions.map(({ name: permissionName, titleKey }) => ({
      name: permissionName,
      title: translate(titleKey),
    })),
    title: translate(titleKey),
  }));

export const isPermissionKey = (value: unknown): value is PermissionKey =>
  typeof value === "string" && permissionKeys.includes(value as PermissionKey);

export const internalEmail = (mobile: string) => `${mobile}@kernel.local`;

export const getUserPermissions = async (
  database: Database,
  userId: string,
): Promise<PermissionKey[]> => {
  const values = await database
    .select({ permission: rolePermissions.permission })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .where(eq(userRoles.userId, userId));

  return [...new Set(values.map(({ permission }) => permission))].filter(
    isPermissionKey,
  );
};

export const getRolesByUserIds = async (
  database: Database,
  userIds: string[],
) => {
  if (userIds.length === 0)
    return new Map<string, Array<{ id: string; name: string }>>();
  const values = await database
    .select({ id: roles.id, name: roles.name, userId: userRoles.userId })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(inArray(userRoles.userId, userIds))
    .orderBy(asc(roles.name));
  const result = new Map<string, Array<{ id: string; name: string }>>();
  for (const value of values) {
    const existing = result.get(value.userId) ?? [];
    existing.push({ id: value.id, name: value.name });
    result.set(value.userId, existing);
  }

  return result;
};

export const serializeUser = (
  value: typeof user.$inferSelect,
  assignedRoles: Array<{ id: string; name: string }> = [],
) => ({
  ...(value.profileEmail && { email: value.profileEmail }),
  first_name: value.firstName,
  id: value.id,
  is_system_admin: value.isSystemAdmin,
  last_name: value.lastName,
  mobile: value.mobile,
  roles: assignedRoles,
  status: value.status,
  ...(value.username && { username: value.username }),
});

export const serializeAccount = async (
  database: Database,
  value: typeof user.$inferSelect,
) => {
  return {
    ...(value.profileEmail && { email: value.profileEmail }),
    first_name: value.firstName,
    id: value.id,
    is_system_admin: value.isSystemAdmin,
    last_name: value.lastName,
    mobile: value.mobile,
    permissions: value.isSystemAdmin
      ? [...permissionKeys]
      : await getUserPermissions(database, value.id),
    status: value.status,
    ...(value.username && { username: value.username }),
  };
};
