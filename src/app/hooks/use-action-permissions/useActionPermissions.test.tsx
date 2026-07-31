import { renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { CoreContext, CoreContextProps } from "@/app/contexts";
import { AccountProps } from "@/features/account/types";

import { useActionPermissions } from "./";

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

const renderActionPermissions = (user?: AccountProps) => {
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

  return renderHook(useActionPermissions, { wrapper }).result.current;
};

describe("useActionPermissions", () => {
  it("denies every action for an unauthenticated user", () => {
    expect(renderActionPermissions()).toEqual({
      canCreateRoles: false,
      canCreateUsers: false,
      canDeleteRoles: false,
      canDeleteUsers: false,
      canUpdateRoles: false,
      canUpdateUsers: false,
    });
  });

  it("allows only explicitly granted actions", () => {
    expect(
      renderActionPermissions(
        createUser({
          permissions: ["roles.create", "users.delete", "users.update"],
        }),
      ),
    ).toEqual({
      canCreateRoles: true,
      canCreateUsers: false,
      canDeleteRoles: false,
      canDeleteUsers: true,
      canUpdateRoles: false,
      canUpdateUsers: true,
    });
  });

  it("allows every action for a system administrator", () => {
    expect(
      renderActionPermissions(createUser({ isSystemAdmin: true })),
    ).toEqual({
      canCreateRoles: true,
      canCreateUsers: true,
      canDeleteRoles: true,
      canDeleteUsers: true,
      canUpdateRoles: true,
      canUpdateUsers: true,
    });
  });
});
