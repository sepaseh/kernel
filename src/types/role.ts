export type RoleProps = {
  id: string;
  name: string;
  permissions: string[];
};

export type RoleMutationParams = {
  name: string;
  permissions: string[];
};
