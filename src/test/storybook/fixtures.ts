import type { Account } from "@/features/account";
import type { PermissionGroup, Role } from "@/features/roles";
import type { User, UserOption, UserSummary } from "@/features/users";

export const sampleAccount: Account = {
  email: "admin@example.com",
  firstName: "Sample",
  id: "storybook-user",
  isSystemAdmin: true,
  lastName: "Admin",
  mobile: "09120000000",
  permissions: [
    "users.create",
    "users.delete",
    "users.update",
    "roles.create",
    "roles.delete",
    "roles.update",
  ],
  personnelCode: "1001",
  status: "active",
  username: "admin",
};

export const roles: Role[] = [
  { id: "role-admin", name: "Administrator", permissions: ["users.read"] },
  { id: "role-editor", name: "Editor", permissions: ["roles.update"] },
];

export const permissions: PermissionGroup[] = [
  {
    name: "users",
    permissions: [
      { name: "users.read", title: "View users" },
      { name: "users.update", title: "Manage users" },
    ],
    title: "Users",
  },
  {
    name: "roles",
    permissions: [
      { name: "roles.read", title: "View roles" },
      { name: "roles.update", title: "Manage roles" },
    ],
    title: "Roles",
  },
];

export const userOptions: UserOption[] = [
  { id: "option-1", name: "Primary" },
  { id: "option-2", name: "Secondary" },
];

export const user: User = {
  email: "sara@example.com",
  firstName: "Sara",
  id: "user-1",
  isSystemAdmin: false,
  lastName: "Ahmadi",
  mobile: "09121111111",
  personnelCode: "1002",
  roleIds: ["option-1"],
  username: "sara",
};

export const users: UserSummary[] = [
  { ...user, status: "active" },
  {
    email: null,
    firstName: "Ali",
    id: "user-2",
    isSystemAdmin: true,
    lastName: "Karimi",
    mobile: "09122222222",
    personnelCode: "1003",
    status: "inactive",
    username: null,
  },
];
