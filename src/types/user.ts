import { PermissionKey } from "./permission";
import { RoleProps } from "./role";

export type UserParams = {
  firstName: string;
  lastName: string;
  isActive: string;
  page: string;
  pageSize: string;
  personnelCode: string;
  roleId: string;
  username: string;
};

export type UserProps = {
  createdAt: number;
  firstName: string;
  lastName: string;
  id: string;
  isActive: boolean;
  password?: string;
  permissions: PermissionKey[];
  personnelCode: string;
  roles: Pick<RoleProps, "id" | "name">[];
  username: string;
};

export type UserRoleParams = {
  roleIds: string[];
};