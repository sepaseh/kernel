import { renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { CoreContext, CoreContextProps } from "@/app/contexts";
import { AccountProps } from "@/features/account/types";

import { useRoutePermissions } from "./useRoutePermissions";

const createUser = (overrides: Partial<AccountProps> = {}): AccountProps => ({
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

const renderRoutePermissions = (
  route: "roles" | "users",
  user?: AccountProps,
) => {
  const value: CoreContextProps = {
    currentRoute: "root",
    language: "en",
    setCurrentRoute: () => undefined,
    setLanguage: () => undefined,
    setTheme: () => undefined,
    setUser: () => undefined,
    theme: "light",
    user,
  };
  const wrapper = ({ children }: { children: ReactNode }) => (
    <CoreContext.Provider value={value}>{children}</CoreContext.Provider>
  );

  return renderHook(() => useRoutePermissions(route), { wrapper }).result
    .current;
};

describe("useRoutePermissions", () => {
  it("denies actions for an unauthenticated user", () => {
    expect(renderRoutePermissions("roles")).toEqual({
      canCreate: false,
      canDelete: false,
      canUpdate: false,
    });
  });

  it("allows only actions granted by the route configuration", () => {
    expect(
      renderRoutePermissions(
        "users",
        createUser({ permissions: ["users.create", "users.update"] }),
      ),
    ).toEqual({
      canCreate: true,
      canDelete: false,
      canUpdate: true,
    });
  });

  it("allows every configured action for a system administrator", () => {
    expect(
      renderRoutePermissions("roles", createUser({ isSystemAdmin: true })),
    ).toEqual({
      canCreate: true,
      canDelete: true,
      canUpdate: true,
    });
  });
});
