export type RoleProps = {
  id: string;
  name: string;
  permissions: string[];
};

export type RoleMutationParams = {
  name: string;
  permissions: string[];
};

type PermissionProps = {
  name: string;
  title: string;
};

export type PermissionGroupProps = {
  name: string;
  permissions: PermissionProps[];
  title: string;
};
