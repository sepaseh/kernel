type UserStatus = "active" | "inactive";

export type UserListParams = {
  email?: string;
  mobile?: string;
  name?: string;
  offset?: string;
  size?: string;
  status?: UserStatus;
  username?: string;
};

export type UserSummaryProps = {
  email: null | string;
  firstName: string;
  id: string;
  isSystemAdmin: boolean;
  lastName: string;
  mobile: string;
  personnelCode: string;
  status: UserStatus;
  username: null | string;
};

export type UserProps = Omit<UserSummaryProps, "status"> & {
  roleIds: string[];
  workspaceIds: string[];
};

export type CreateUserParams = {
  firstName: string;
  lastName: string;
  mobile: string;
  password: string;
  personnelCode: string;
};

export type UpdateUserParams = Partial<
  Pick<CreateUserParams, "firstName" | "lastName" | "mobile" | "personnelCode">
>;

export type UserRoleParams = {
  roleIds: string[];
};

export type UserWorkspaceParams = {
  workspaceIds: string[];
};

export type UserSystemAdminParams = {
  isSystemAdmin: boolean;
};

export type UserPasswordParams = {
  password: string;
};

export type UserStatusParams = {
  status: UserStatus;
};

export type UserOptionProps = {
  id: string;
  name: string;
};
