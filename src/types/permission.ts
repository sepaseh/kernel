export type PermissionKey = string;

type PermissionProps = {
  name: PermissionKey;
  title: string;
};

export type PermissionGroupProps = {
  name: string;
  permissions: PermissionProps[];
  title: string;
};
