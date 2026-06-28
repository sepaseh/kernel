export const routeTree = {
  auth: { path: "/auth" },
  notFound: { path: "*" },
  password: { path: "/password" },
  roles: { path: "/roles" },
  root: { path: "/" },
  users: { path: "/users" },
} satisfies Record<string, { path: string; link?: (...args: string[]) => string }>;

export type RouteKey = keyof typeof routeTree;
