export type PermissionKey =
  | "role_create"
  | "role_delete"
  | "role_read"
  | "role_update"
  | "user_create"
  | "user_delete"
  | "user_read"
  | "user_roles_update"
  | "user_status_update"
  | "user_update";

export type PermissionProps = {
  description: string;
  groupName: string;
  groupTitle: string;
  name: PermissionKey;
  title: string;
};