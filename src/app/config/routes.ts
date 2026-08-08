import type { PermissionKey } from "@/features/roles";

export type AccessRule = "authenticated" | "public" | PermissionKey;

type RoutePermissions = {
  access: AccessRule;
  actions: Record<string, PermissionKey>;
};

export const routeTree = {
  account: {
    path: "/account",
    permissions: { access: "authenticated", actions: {} },
  },
  auth: {
    path: "/auth",
    permissions: { access: "public", actions: {} },
  },
  forgotPassword: {
    path: "/auth/forgot-password",
    permissions: { access: "public", actions: {} },
  },
  notFound: {
    path: "*",
    permissions: { access: "public", actions: {} },
  },
  register: {
    path: "/auth/register",
    permissions: { access: "public", actions: {} },
  },
  roles: {
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
    path: "/",
    permissions: { access: "authenticated", actions: {} },
  },
  users: {
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
} satisfies Record<
  string,
  {
    path: string;
    link?: (...args: string[]) => string;
    permissions: RoutePermissions;
  }
>;

export type RouteKey = keyof typeof routeTree;

export const baseUrl: string = import.meta.env.VITE_APP_BASE_URL ?? "";
