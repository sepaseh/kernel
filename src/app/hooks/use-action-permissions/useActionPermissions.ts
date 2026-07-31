import { useMemo } from "react";

import { useCore } from "@/app/hooks/use-core";

type ActionPermissions = {
  canCreateRoles: boolean;
  canCreateUsers: boolean;
  canDeleteRoles: boolean;
  canDeleteUsers: boolean;
  canUpdateRoles: boolean;
  canUpdateUsers: boolean;
};

export const useActionPermissions = (): ActionPermissions => {
  const { user } = useCore();

  return useMemo(() => {
    if (user?.isSystemAdmin) {
      return {
        canCreateRoles: true,
        canCreateUsers: true,
        canDeleteRoles: true,
        canDeleteUsers: true,
        canUpdateRoles: true,
        canUpdateUsers: true,
      };
    }

    const permissions = new Set<string>(user?.permissions);

    return {
      canCreateRoles: permissions.has("roles.create"),
      canCreateUsers: permissions.has("users.create"),
      canDeleteRoles: permissions.has("roles.delete"),
      canDeleteUsers: permissions.has("users.delete"),
      canUpdateRoles: permissions.has("roles.update"),
      canUpdateUsers: permissions.has("users.update"),
    };
  }, [user]);
};
