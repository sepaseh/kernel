import { render, screen } from "@testing-library/react";
import { Outlet } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const routeState = vi.hoisted(() => ({
  allowedRoutes: new Set([
    "account",
    "auth",
    "forgotPassword",
    "notFound",
    "register",
    "roles",
    "root",
    "users",
  ]),
  dashboardError: false,
  setCurrentRoute: vi.fn(),
}));

vi.mock("@/app/hooks", () => ({
  useCore: () => ({ setCurrentRoute: routeState.setCurrentRoute, user: {} }),
}));
vi.mock("@/app/lib", () => ({
  hasRouteAccess: (route: string) => routeState.allowedRoutes.has(route),
}));
vi.mock("@/layouts/auth", () => ({ AuthLayout: () => <Outlet /> }));
vi.mock("@/layouts/default", () => ({ DefaultLayout: () => <Outlet /> }));
vi.mock("@/features/account", () => ({ AccountPage: () => "Account page" }));
vi.mock("@/features/dashboard", () => ({
  DashboardPage: () => {
    if (routeState.dashboardError) throw new Error("dashboard failed");
    return "Dashboard page";
  },
}));
vi.mock("@/features/auth/forgot-pass", () => ({
  ForgotPassPage: () => "Forgot password page",
}));
vi.mock("@/features/auth/login", () => ({ LoginPage: () => "Login page" }));
vi.mock("@/features/auth/register", () => ({
  RegisterPage: () => "Register page",
}));
vi.mock("@/features/roles", () => ({ RolesPage: () => "Roles page" }));
vi.mock("@/features/users", () => ({ UsersPage: () => "Users page" }));

beforeEach(() => {
  routeState.dashboardError = false;
  routeState.setCurrentRoute.mockClear();
  vi.resetModules();
});

describe("application routes", () => {
  it("renders the not-found page for an unknown route", async () => {
    window.history.replaceState({}, "", "/unknown-route");
    const { Routes } = await import("./Routes");

    render(<Routes />);

    expect(await screen.findByText("404")).toBeInTheDocument();
  }, 30_000);

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

  it("renders and reports the application fallback when a route fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const send = vi.fn();
    routeState.dashboardError = true;
    window.history.replaceState({}, "", "/");
    const { Routes } = await import("./Routes");
    const { setObservabilityTransport } = await import("@/shared/lib");
    setObservabilityTransport(send);

    render(<Routes />);

    expect(await screen.findByText("500")).toBeVisible();
    expect(
      screen.getByText(/An unexpected error occurred|خطای غیرمنتظره‌ای رخ داد/),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: /Reload|بارگذاری مجدد/ }),
    ).toBeVisible();
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({
          source: "react-router.error-boundary",
        }),
        message: "dashboard failed",
        name: "error",
      }),
    );
  });
});
