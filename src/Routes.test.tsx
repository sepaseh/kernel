import { render, screen } from "@testing-library/react";
import { Outlet } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const routeState = vi.hoisted(() => ({
  allowedRoutes: new Set([
    "account",
    "auth",
    "forgotPassword",
    "register",
    "roles",
    "root",
    "users",
  ]),
  setCurrentRoute: vi.fn(),
}));

vi.mock("@/hooks", () => ({
  useAllowedRoutes: () => routeState.allowedRoutes,
  useCore: () => ({ setCurrentRoute: routeState.setCurrentRoute }),
}));
vi.mock("@/layouts/Auth", () => ({ AuthLayout: () => <Outlet /> }));
vi.mock("@/layouts/Default", () => ({ DefaultLayout: () => <Outlet /> }));
vi.mock("@/pages/Account", () => ({ AccountPage: () => "Account page" }));
vi.mock("@/pages/Dashboard", () => ({
  DashboardPage: () => "Dashboard page",
}));
vi.mock("@/pages/ForgotPass", () => ({
  ForgotPassPage: () => "Forgot password page",
}));
vi.mock("@/pages/Login", () => ({ LoginPage: () => "Login page" }));
vi.mock("@/pages/Register", () => ({ RegisterPage: () => "Register page" }));
vi.mock("@/pages/Roles", () => ({ RolesPage: () => "Roles page" }));
vi.mock("@/pages/Users", () => ({ UsersPage: () => "Users page" }));

beforeEach(() => {
  routeState.setCurrentRoute.mockClear();
  vi.resetModules();
});

describe("application routes", () => {
  it("renders the not-found page for an unknown route", async () => {
    window.history.replaceState({}, "", "/unknown-route");
    const { Routes } = await import("./Routes");

    render(<Routes />);

    expect(await screen.findByText("404")).toBeInTheDocument();
  });

  it.each([
    ["/", "Dashboard page", "root"],
    ["/account", "Account page", "account"],
    ["/users", "Users page", "users"],
    ["/roles", "Roles page", "roles"],
    ["/auth", "Login page", "auth"],
    ["/auth/forgot-password", "Forgot password page", "forgotPassword"],
    ["/auth/register", "Register page", "register"],
  ])("renders the allowed route %s", async (path, content, route) => {
    window.history.replaceState({}, "", path);
    const { Routes } = await import("./Routes");

    render(<Routes />);

    expect(await screen.findByText(content)).toBeInTheDocument();
    expect(routeState.setCurrentRoute).toHaveBeenCalledWith(route);
  });

  it("redirects a disallowed route to the dashboard", async () => {
    routeState.allowedRoutes.delete("users");
    window.history.replaceState({}, "", "/users");
    const { Routes } = await import("./Routes");

    render(<Routes />);

    expect(await screen.findByText("Dashboard page")).toBeInTheDocument();
    routeState.allowedRoutes.add("users");
  });
});
