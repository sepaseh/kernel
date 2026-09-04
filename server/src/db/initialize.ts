import { fileURLToPath } from "node:url";

import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";

import type { Auth } from "../auth.ts";
import type { ServerConfig } from "../config.ts";
import { permissionKeys } from "../domain.ts";
import { getTranslator } from "../i18n.ts";
import type { Database } from "./client.ts";
import {
  calendarDates,
  rolePermissions,
  roles,
  session,
  settings,
  user,
  userRoles,
} from "./schema.ts";

const defaultDarkTheme = {
  color_bg_base: "#141414",
  color_bg_container: "#1f1f1f",
  color_border: "#424242",
  color_link: "#1668dc",
  color_primary: "#61dafb",
  color_text_base: "#ffffff",
  color_text_description: "#bfbfbf",
};

const defaultLightTheme = {
  color_bg_base: "#ffffff",
  color_bg_container: "#ffffff",
  color_border: "#d9d9d9",
  color_link: "#1677ff",
  color_primary: "#61dafb",
  color_text_base: "#000000",
  color_text_description: "#8c8c8c",
};

const seed = async (database: Database, auth: Auth) => {
  const configuredSettings = await database.query.settings.findFirst({
    where: eq(settings.id, 1),
  });
  const translate = getTranslator(configuredSettings?.languageCode ?? "en");
  const existingAdmin = await database.query.user.findFirst({
    where: eq(user.mobile, "09123456789"),
  });
  let adminId = existingAdmin?.id;
  if (!existingAdmin) {
    const result = await auth.api.signUpEmail({
      body: {
        email: "admin@kernel.local",
        firstName: translate("seedAdminFirstName"),
        lastName: translate("seedAdminLastName"),
        mobile: "09123456789",
        name: translate("seedAdminName"),
        password: "password123",
        username: "admin",
      },
    });
    adminId = result.user.id;
    await database
      .update(user)
      .set({ isSystemAdmin: true })
      .where(eq(user.id, adminId));
    await database.delete(session).where(eq(session.userId, adminId));
  }

  await database
    .insert(calendarDates)
    .values([{ date: "2026-09-15" }, { date: "2026-09-23" }])
    .onConflictDoNothing();

  const defaultRoleId = "3ecb1f52-6d6e-43b9-a8fb-4e0772c9f863";
  await database
    .insert(roles)
    .values({ id: defaultRoleId, name: translate("seedDefaultRole") })
    .onConflictDoNothing();
  await database
    .insert(rolePermissions)
    .values(
      permissionKeys.map((permission) => ({
        permission,
        roleId: defaultRoleId,
      })),
    )
    .onConflictDoNothing();
  if (adminId) {
    await database
      .insert(userRoles)
      .values({ roleId: defaultRoleId, userId: adminId })
      .onConflictDoNothing();
  }
};

export const initializeDatabase = async (
  config: ServerConfig,
  database: Database,
  auth: Auth,
) => {
  await migrate(database, {
    migrationsFolder: fileURLToPath(new URL("../../drizzle", import.meta.url)),
  });
  await database
    .insert(settings)
    .values({
      darkTheme: JSON.stringify(defaultDarkTheme),
      id: 1,
      languageCode: "fa",
      lightTheme: JSON.stringify(defaultLightTheme),
    })
    .onConflictDoNothing();
  if (config.seedDevelopmentData) await seed(database, auth);
};
