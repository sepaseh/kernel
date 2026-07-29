import { PermissionKey } from "./permission";

export type RoleProps = {
  id: string;
  name: string;
  permissions: PermissionKey[];
};

export type RoleMutationParams = {
  name: string;
  permissions: PermissionKey[];
};
