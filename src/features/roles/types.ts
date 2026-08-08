export type PermissionKey =
  | "roles.create"
  | "roles.delete"
  | "roles.read"
  | "roles.update"
  | "users.create"
  | "users.delete"
  | "users.read"
  | "users.update";

export type RoleProps = {
  id: string;
  name: string;
  permissions: PermissionKey[];
};

export type RoleMutationParams = {
  name: string;
  permissions: PermissionKey[];
};

type PermissionProps = {
  name: PermissionKey;
  title: string;
};

export type PermissionGroupProps = {
  name: string;
  permissions: PermissionProps[];
  title: string;
};
