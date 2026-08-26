export type PermissionKey =
  | "roles.create"
  | "roles.delete"
  | "roles.read"
  | "roles.update"
  | "users.create"
  | "users.delete"
  | "users.read"
  | "users.update";

export type Role = {
  id: string;
  name: string;
  permissions: PermissionKey[];
};

export type RoleRequest = Pick<Role, "name" | "permissions">;

type Permission = {
  name: PermissionKey;
  title: string;
};

export type PermissionGroup = {
  name: string;
  permissions: Permission[];
  title: string;
};

export type PermissionGroupProps = PermissionGroup;
export type RoleMutationParams = RoleRequest;
export type RoleProps = Role;
