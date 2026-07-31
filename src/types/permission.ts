type PermissionProps = {
  name: string;
  title: string;
};

export type PermissionGroupProps = {
  name: string;
  permissions: PermissionProps[];
  title: string;
};
