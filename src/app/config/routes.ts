import type { ParseKeys } from "i18next";

import type { PermissionKey } from "@/features/roles";

export type AccessRule = "authenticated" | "public" | PermissionKey;
export type RouteLayout = "auth" | "default" | "standalone";

type RoutePermissions = {
  access: AccessRule;
  actions: Record<string, PermissionKey>;
};

type RouteConfig = {
  index?: boolean;
  label?: ParseKeys;
  layout: RouteLayout;
  path: string;
  permissions: RoutePermissions;
};

export const routeTree = {
  account: {
    layout: "default",
    path: "/account",
    permissions: { access: "authenticated", actions: {} },
  },
  auth: {
    index: true,
    layout: "auth",
    path: "/auth",
    permissions: { access: "public", actions: {} },
  },
  forgotPassword: {
    layout: "auth",
    path: "/auth/forgot-password",
    permissions: { access: "public", actions: {} },
  },
  notFound: {
    layout: "standalone",
    path: "*",
    permissions: { access: "public", actions: {} },
  },
  register: {
    layout: "auth",
    path: "/auth/register",
    permissions: { access: "public", actions: {} },
  },
  roles: {
    label: "roles",
    layout: "default",
    path: "/roles",
    permissions: {
      access: "roles.read",
      actions: {
        canCreate: "roles.create",
        canDelete: "roles.delete",
        canUpdate: "roles.update",
      },
    },
  },
  root: {
    index: true,
    label: "dashboard",
    layout: "default",
    path: "/",
    permissions: { access: "authenticated", actions: {} },
  },
  users: {
    label: "users",
    layout: "default",
    path: "/users",
    permissions: {
      access: "users.read",
      actions: {
        canCreate: "users.create",
        canDelete: "users.delete",
        canUpdate: "users.update",
      },
    },
  },
} satisfies Record<string, RouteConfig>;

export type RouteKey = keyof typeof routeTree;

type NavigationRouteKey = {
  [Key in RouteKey]: (typeof routeTree)[Key] extends { label: ParseKeys }
    ? Key
    : never;
}[RouteKey];

export type NavigationItem =
  | { route: NavigationRouteKey }
  | {
      children: readonly NavigationItem[];
      key: string;
      label: ParseKeys;
    };

export const navigationTree: readonly NavigationItem[] = [
  { route: "root" },
  { route: "users" },
  { route: "roles" },
];

export const baseUrl: string = import.meta.env.VITE_APP_BASE_URL ?? "";
