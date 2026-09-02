import type { Role } from "@/features/roles";
import type { ListQuery } from "@/shared/api";

export type User = {
  email?: string;
  firstName: string;
  id: string;
  isSystemAdmin: boolean;
  lastName: string;
  mobile: string;
  roles: Array<Pick<Role, "id" | "name">>;
  status: "active" | "inactive";
  username?: string;
};

export type UserListQuery = ListQuery &
  Partial<
    Pick<
      User,
      "email" | "firstName" | "lastName" | "mobile" | "status" | "username"
    >
  >;

export type UserPasswordRequest = { password: string };

export type UserRequest = Pick<User, "firstName" | "lastName" | "mobile">;

export type UserRoleRequest = { roleIds: Array<Role["id"]> };

export type UserStatusRequest = Pick<User, "status">;

export type UserSystemAdminRequest = Pick<User, "isSystemAdmin">;
