import { renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { CoreContext, CoreContextProps } from "@/app/contexts";
import { AccountProps } from "@/types";

import { useAllowedRoutes } from "./";

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

const renderAllowedRoutes = (user?: AccountProps) => {
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

  return renderHook(useAllowedRoutes, { wrapper }).result.current;
};

describe("useAllowedRoutes", () => {
  it("allows only public routes for an unauthenticated user", () => {
    const routes = renderAllowedRoutes();

    expect(routes).toEqual(
      new Set(["auth", "forgotPassword", "notFound", "register"]),
    );
  });

  it("allows authenticated routes and routes with granted permissions", () => {
    const routes = renderAllowedRoutes(
      createUser({ permissions: ["users.read"] }),
    );

    expect(routes).toEqual(
      new Set([
        "account",
        "auth",
        "forgotPassword",
        "notFound",
        "register",
        "root",
        "users",
      ]),
    );
  });

  it("denies routes when the required permission is absent", () => {
    const routes = renderAllowedRoutes(createUser());

    expect(routes.has("users")).toBe(false);
    expect(routes.has("roles")).toBe(false);
  });

  it("allows every route for a system administrator", () => {
    const routes = renderAllowedRoutes(createUser({ isSystemAdmin: true }));

    expect(routes).toEqual(
      new Set([
        "account",
        "auth",
        "forgotPassword",
        "notFound",
        "register",
        "roles",
        "root",
        "users",
      ]),
    );
  });
});
