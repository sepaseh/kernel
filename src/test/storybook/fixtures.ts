import { AccountProps } from "@/features/account";
import { PermissionGroupProps, RoleProps } from "@/features/roles";
import { UserOptionProps, UserProps, UserSummaryProps } from "@/features/users";

export const sampleAccount: AccountProps = {
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

export const roles: RoleProps[] = [
  { id: "role-admin", name: "Administrator", permissions: ["users.read"] },
  { id: "role-editor", name: "Editor", permissions: ["content.write"] },
];

export const permissions: PermissionGroupProps[] = [
  {
    name: "users",
    permissions: [
      { name: "users.read", title: "View users" },
      { name: "users.write", title: "Manage users" },
    ],
    title: "Users",
  },
  {
    name: "content",
    permissions: [
      { name: "content.read", title: "View content" },
      { name: "content.write", title: "Manage content" },
    ],
    title: "Content",
  },
];

export const userOptions: UserOptionProps[] = [
  { id: "option-1", name: "Primary" },
  { id: "option-2", name: "Secondary" },
];

export const user: UserProps = {
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

export const users: UserSummaryProps[] = [
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
