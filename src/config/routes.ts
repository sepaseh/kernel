export type RouteKey =
  | "auth"
  | "notFound"
  | "password"
  | "roles"
  | "root"
  | "users";

export const routeTree = {
  auth: { path: "/auth" },
  notFound: { path: "*" },
  password: { path: "/password" },
  roles: { path: "/roles" },
  root: { path: "/" },
  users: { path: "/users" },
} satisfies Record<
  RouteKey,
  { path: string; link?: (...args: string[]) => string }
>;