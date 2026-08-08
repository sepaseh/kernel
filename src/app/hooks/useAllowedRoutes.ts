import { useMemo } from "react";

import { AccessRule, RouteKey, routeTree } from "@/app/config";
import { AccountProps } from "@/features/account";

import { useCore } from "./useCore";

const ROUTE_KEYS = Object.keys(routeTree) as RouteKey[];

export const hasAccess = (access: AccessRule, user?: AccountProps): boolean => {
  if (access === "public") return true;
  if (!user) return false;
  if (access === "authenticated" || user.isSystemAdmin) return true;

  return user.permissions.includes(access);
};

export const useAllowedRoutes = (): ReadonlySet<RouteKey> => {
  const { user } = useCore();

  return useMemo(
    () =>
      new Set(
        ROUTE_KEYS.filter((route) =>
          hasAccess(routeTree[route].permissions.access, user),
        ),
      ),
    [user],
  );
};
