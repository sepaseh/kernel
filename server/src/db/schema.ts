import { relations } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  displayUsername: text("display_username"),
  // Better Auth requires an internal email-shaped identifier even when the
  // product authenticates users by mobile number.
  email: text("auth_email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  firstName: text("first_name").notNull(),
  id: text("id").primaryKey(),
  image: text("image"),
  isSystemAdmin: integer("is_system_admin", { mode: "boolean" })
    .default(false)
    .notNull(),
  lastName: text("last_name").notNull(),
  mobile: text("mobile").notNull().unique(),
  name: text("name").notNull(),
  profileEmail: text("email").unique(),
  status: text("status", { enum: ["active", "inactive"] })
    .default("active")
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  username: text("username").unique(),
});

export const session = sqliteTable(
  "session",
  {
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    id: text("id").primaryKey(),
    ipAddress: text("ip_address"),
    token: text("token").notNull().unique(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_index").on(table.userId)],
);

export const account = sqliteTable(
  "account",
  {
    accessToken: text("access_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp",
    }),
    accountId: text("account_id").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    id: text("id").primaryKey(),
    idToken: text("id_token"),
    issuer: text("issuer").notNull(),
    password: text("password"),
    providerId: text("provider_id").notNull(),
    refreshToken: text("refresh_token"),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp",
    }),
    scope: text("scope"),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("account_user_id_index").on(table.userId),
    uniqueIndex("account_issuer_account_id_index").on(
      table.issuer,
      table.accountId,
    ),
  ],
);

export const verification = sqliteTable(
  "verification",
  {
    createdAt: integer("created_at", { mode: "timestamp" }),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
    value: text("value").notNull(),
  },
  (table) => [index("verification_identifier_index").on(table.identifier)],
);

export const roles = sqliteTable("roles", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const rolePermissions = sqliteTable(
  "role_permissions",
  {
    permission: text("permission").notNull(),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permission] })],
);

export const userRoles = sqliteTable(
  "user_roles",
  {
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "restrict" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })],
);

export const files = sqliteTable("files", {
  bucket: text("bucket").notNull(),
  contentType: text("content_type").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  id: text("id").primaryKey(),
  objectKey: text("object_key").notNull().unique(),
  originalName: text("original_name").notNull(),
  size: integer("size").notNull(),
  visibility: text("visibility", { enum: ["private", "public"] }).notNull(),
});

export const settings = sqliteTable("settings", {
  darkLogoId: text("dark_logo_id").references(() => files.id, {
    onDelete: "set null",
  }),
  darkTheme: text("dark_theme").notNull(),
  id: integer("id").primaryKey(),
  languageCode: text("language_code").notNull(),
  lightLogoId: text("light_logo_id").references(() => files.id, {
    onDelete: "set null",
  }),
  lightTheme: text("light_theme").notNull(),
});

export const calendarDates = sqliteTable("calendar_dates", {
  date: text("date").primaryKey(),
});

export const otpCodes = sqliteTable(
  "otp_codes",
  {
    consumedAt: integer("consumed_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    destination: text("destination").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    id: text("id").primaryKey(),
    purpose: text("purpose").notNull(),
    valueHash: text("value_hash").notNull(),
  },
  (table) => [
    index("otp_destination_purpose_index").on(table.destination, table.purpose),
  ],
);

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
}));
