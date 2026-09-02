type Permission = { name: PermissionKey; title: string };

export type PermissionGroup = {
  name: string;
  permissions: Permission[];
  title: string;
};

export type PermissionKey =
  | "calendar.read"
  | "calendar.update"
  | "roles.create"
  | "roles.delete"
  | "roles.read"
  | "roles.update"
  | "settings.update"
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
