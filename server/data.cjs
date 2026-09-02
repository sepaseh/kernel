const fullPermissions = [
  "calendar.read",
  "calendar.update",
  "roles.create",
  "roles.delete",
  "roles.read",
  "roles.update",
  "settings.update",
  "users.create",
  "users.delete",
  "users.read",
  "users.update",
];

const users = [
  {
    email: "admin@example.com",
    first_name: "مدیر",
    id: "2dc56d6f-6b5a-4e0d-9b0b-9a1c9d7f8d41",
    is_system_admin: true,
    last_name: "سیستم",
    mobile: "09123456789",
    password: "password123",
    permissions: fullPermissions,
    roles: [],
    status: "active",
    username: "admin",
  },
  {
    email: "operator@example.com",
    first_name: "کاربر",
    id: "89a975c0-f6a4-4cb8-97c6-c558381b68d2",
    is_system_admin: false,
    last_name: "نمونه",
    mobile: "09120000000",
    password: "password123",
    permissions: fullPermissions,
    roles: [
      {
        id: "3ecb1f52-6d6e-43b9-a8fb-4e0772c9f863",
        name: "کاربر",
      },
    ],
    status: "active",
    username: "operator",
  },
];

const findUser = (identifier) =>
  users.find(
    (user) =>
      user.mobile === identifier ||
      user.username.toLowerCase() === String(identifier).toLowerCase(),
  );

const publicUser = (user) => {
  const value = { ...user };
  delete value.password;
  return value;
};

module.exports = { findUser, fullPermissions, publicUser, users };
