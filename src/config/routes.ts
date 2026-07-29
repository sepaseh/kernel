export const routeTree = {
  account: { path: "/account" },
  auth: { path: "/auth" },
  forgotPassword: { path: "/auth/forgot-password" },
  notFound: { path: "*" },
  register: { path: "/auth/register" },
  roles: { path: "/roles" },
  root: { path: "/" },
  users: { path: "/users" },
} satisfies Record<
  string,
  { path: string; link?: (...args: string[]) => string }
>;

export type RouteKey = keyof typeof routeTree;
