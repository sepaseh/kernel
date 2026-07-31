import { useMemo } from "react";

import { RouteKey } from "@/app/config";
import { useCore } from "@/app/hooks/use-core/useCore";

const ROUTE_RULES: Record<RouteKey, string> = {
  account: "auth",
  auth: "public",
  forgotPassword: "public",
  notFound: "public",
  register: "public",
  roles: "roles.read",
  root: "auth",
  users: "users.read",
};

const ROUTE_KEYS = Object.keys(ROUTE_RULES) as RouteKey[];

export const useAllowedRoutes = (): ReadonlySet<RouteKey> => {
  const { user } = useCore();

  return useMemo(
    () =>
      new Set(
        ROUTE_KEYS.filter((route) => {
          const access = ROUTE_RULES[route];

          if (access === "public") return true;
          if (!user) return false;
          if (access === "auth") return true;
          if (user.isSystemAdmin) return true;

          return user.permissions.includes(access);
        }),
      ),
    [user],
  );
};
