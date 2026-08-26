type UserStatus = "active" | "inactive";

export type ListUsersQuery = {
  email?: string;
  mobile?: string;
  name?: string;
  offset?: string;
  size?: string;
  status?: UserStatus;
  username?: string;
};

export type UserSummary = {
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

export type User = Omit<UserSummary, "status"> & {
  roleIds: string[];
};

export type CreateUserRequest = {
  firstName: string;
  lastName: string;
  mobile: string;
  password: string;
  personnelCode: string;
};

export type UpdateUserRequest = Partial<
  Pick<CreateUserRequest, "firstName" | "lastName" | "mobile" | "personnelCode">
>;

export type UserRoleRequest = {
  roleIds: string[];
};

export type UserSystemAdminRequest = {
  isSystemAdmin: boolean;
};

export type UserPasswordRequest = {
  password: string;
};

export type UserStatusRequest = {
  status: UserStatus;
};

export type UserOption = {
  id: string;
  name: string;
};

export type CreateUserParams = CreateUserRequest;
export type UpdateUserParams = UpdateUserRequest;
export type UserListParams = ListUsersQuery;
export type UserOptionProps = UserOption;
export type UserPasswordParams = UserPasswordRequest;
export type UserProps = User;
export type UserRoleParams = UserRoleRequest;
export type UserSummaryProps = UserSummary;
