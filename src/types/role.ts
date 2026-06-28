import { PermissionKey } from "./permission";

export type RoleParams = {
  page: string;
  pageSize: string;
};

export type RoleProps = {
  createdAt: number;
  description: string;
  id: string;
  name: string;
  permissions: PermissionKey[];
};