export type RouteKey = "notFound" | "root";

export const routeTree = {
  notFound: { path: "*" },
  root: { path: "/" },
} satisfies Record<RouteKey, { path: string; link?: (...args: string[]) => string }>;
