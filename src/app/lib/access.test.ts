import { describe, expect, it } from "vitest";

import { type Account } from "@/features/account";

import {
  getAllowedNavigation,
  getRoutePermissions,
  hasRouteAccess,
} from "./access";

const createUser = (overrides: Partial<Account> = {}): Account => ({
  email: null,
  firstName: "Test",
  id: "user-1",
  isSystemAdmin: false,
  lastName: "User",
  mobile: "09120000000",
  permissions: [],
  personnelCode: null,
  status: "active",
  username: "test-user",
  ...overrides,
});

describe("access policy", () => {
  it("allows only public routes without a user", () => {
    expect(hasRouteAccess("auth")).toBe(true);
    expect(hasRouteAccess("root")).toBe(false);
    expect(hasRouteAccess("users")).toBe(false);
  });

  it("allows authenticated routes without granting permission routes", () => {
    const user = createUser();

    expect(hasRouteAccess("root", user)).toBe(true);
    expect(hasRouteAccess("users", user)).toBe(false);
  });

  it("allows every route and action for a system administrator", () => {
    const user = createUser({ isSystemAdmin: true });

    expect(hasRouteAccess("users", user)).toBe(true);
    expect(getRoutePermissions("roles", user)).toEqual({
      canCreate: true,
      canDelete: true,
      canUpdate: true,
    });
  });

  it("returns only granted actions", () => {
    expect(
      getRoutePermissions(
        "users",
        createUser({ permissions: ["users.create", "users.update"] }),
      ),
    ).toEqual({ canCreate: true, canDelete: false, canUpdate: true });
  });

  it("removes empty navigation groups", () => {
    expect(getAllowedNavigation(createUser())).toEqual([{ route: "root" }]);
  });
});
