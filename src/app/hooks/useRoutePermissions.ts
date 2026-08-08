import { useMemo } from "react";

import { RouteKey, routeTree } from "@/app/config";

import { hasAccess } from "./useAllowedRoutes";
import { useCore } from "./useCore";

type RouteActionPermissions<Key extends RouteKey> = {
  [Action in keyof (typeof routeTree)[Key]["permissions"]["actions"]]: boolean;
};

export const useRoutePermissions = <Key extends RouteKey>(
  route: Key,
): RouteActionPermissions<Key> => {
  const { user } = useCore();
  const actions = routeTree[route].permissions.actions;

  return useMemo(
    () =>
      Object.fromEntries(
        Object.entries(actions).map(([action, permission]) => [
          action,
          hasAccess(permission, user),
        ]),
      ) as RouteActionPermissions<Key>,
    [actions, user],
  );
};
