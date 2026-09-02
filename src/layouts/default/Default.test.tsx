import { waitFor, within } from "@testing-library/react";
import type * as ReactI18next from "react-i18next";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAccount } from "@/features/account";
import type { Account } from "@/features/account/types";
import { logout } from "@/features/auth";
import { clearAccessToken, setUnauthorizedHandler } from "@/shared/api";
import { render, screen } from "@/test/render";

import { DefaultLayout } from "./Default";

const mocks = vi.hoisted(() => {
  const account: Account = {
    email: "ada@example.com",
    firstName: "Ada",
    id: "user-1",
    isSystemAdmin: false,
    lastName: "Lovelace",
    mobile: "09120000000",
    permissions: ["users.read"],
    status: "active",
    username: "ada",
  };

  return {
    account,
    core: {
      compact: false,
      currentRoute: "root",
      logos: { dark: "/dark-logo.svg", light: "/light-logo.svg" },
      setCompact: vi.fn(),
      setTheme: vi.fn(),
      setUser: vi.fn(),
      theme: "light",
      user: account as typeof account | undefined,
    },
  };
});

vi.mock("@/features/account", () => ({
  getAccount: vi.fn(),
}));

vi.mock("@/features/auth", () => ({
  logout: vi.fn(),
}));

vi.mock("@/shared/api", () => ({
  clearAccessToken: vi.fn(),
  setUnauthorizedHandler: vi.fn(),
}));

vi.mock("@/app/hooks", () => ({
  useCore: () => mocks.core,
}));

vi.mock("@/app/lib", () => ({
  getAllowedNavigation: () => [
    { route: "root" },
    {
      children: [{ route: "users" }, { route: "roles" }],
      key: "userManagement",
      label: "userManagement",
    },
  ],
}));

vi.mock("antd-style", () => ({
  useAntdToken: () => ({
    colorBgContainer: "#ffffff",
    colorBgLayout: "#f5f5f5",
    colorTextBase: "#222222",
    marginMD: 16,
    paddingMD: 16,
    paddingSM: 8,
    screenXXXL: 1920,
  }),
}));

vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<typeof ReactI18next>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

const Location = () => {
  const location = useLocation();
  return <output aria-label="location">{location.pathname}</output>;
};

const renderLayout = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Location />
      <Routes>
        <Route element={<DefaultLayout />} path="/">
          <Route index element={<h1>Dashboard content</h1>} />
        </Route>
        <Route element={<h1>Authentication</h1>} path="/auth" />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  mocks.core.compact = false;
  mocks.core.theme = "light";
  mocks.core.user = mocks.account;
  vi.mocked(getAccount).mockResolvedValue(mocks.account);
  vi.mocked(logout).mockResolvedValue(undefined);
});

describe("DefaultLayout", () => {
  it("constrains the header and page content to the shared container", () => {
    const { container } = renderLayout();
    const headerContent = container.querySelector("header")?.firstElementChild;
    const main = container.querySelector("main");

    expect(headerContent).toHaveStyle({
      marginInline: "auto",
      maxWidth: "1920px",
    });
    expect(main).toHaveStyle({
      backgroundColor: "#f5f5f5",
      marginInline: "auto",
      maxWidth: "1920px",
    });
  });

  it("shows the active page hierarchy in a breadcrumb", () => {
    mocks.core.currentRoute = "users";

    renderLayout();

    const breadcrumb = screen.getByRole("navigation", { name: "breadcrumb" });
    expect(breadcrumb).toHaveTextContent("dashboard/userManagement/users");
    expect(
      within(breadcrumb).getByRole("link", { name: "dashboard" }),
    ).toHaveAttribute("href", "/");
  });

  it("loads the account, registers session handling, and logs out", async () => {
    const { unmount, user } = renderLayout();

    expect(
      screen.getByRole("heading", { name: "Dashboard content" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "logo" })).toBeVisible();
    expect(screen.getByRole("img", { name: "logo" })).toHaveAttribute(
      "src",
      "/light-logo.svg",
    );
    await waitFor(() => expect(getAccount).toHaveBeenCalledOnce());
    expect(mocks.core.setUser).toHaveBeenCalledWith(mocks.account);
    expect(setUnauthorizedHandler).toHaveBeenCalledWith(expect.any(Function));

    await user.click(screen.getByRole("button", { name: "account" }));
    await user.click(await screen.findByText("logout"));

    await waitFor(() => expect(logout).toHaveBeenCalledOnce());
    expect(clearAccessToken).toHaveBeenCalledOnce();
    expect(mocks.core.setUser).toHaveBeenLastCalledWith();
    expect(screen.getByLabelText("location")).toHaveTextContent("/auth");

    unmount();
    expect(setUnauthorizedHandler).toHaveBeenLastCalledWith(null);
  });

  it("shows the account name beside the user icon as a tooltip", async () => {
    const { user } = renderLayout();

    await user.hover(screen.getByRole("button", { name: "account" }));

    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Ada Lovelace",
    );
  });

  it("clears the session when loading the account fails", async () => {
    vi.mocked(getAccount).mockRejectedValueOnce(new Error("Unauthorized"));

    renderLayout();

    await waitFor(() =>
      expect(screen.getByLabelText("location")).toHaveTextContent("/auth"),
    );
    expect(clearAccessToken).toHaveBeenCalledOnce();
    expect(mocks.core.setUser).toHaveBeenCalledWith();
  });

  it("shows a loading state while the account is unavailable", () => {
    mocks.core.user = undefined;
    vi.mocked(getAccount).mockReturnValueOnce(new Promise(() => undefined));

    const { container } = renderLayout();

    expect(container.querySelector(".ant-spin")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "logo" }),
    ).not.toBeInTheDocument();
  });

  it("changes theme from the account menu", async () => {
    const { user } = renderLayout();

    await user.click(screen.getByRole("button", { name: "account" }));
    await user.click(await screen.findByText("darkMode"));

    expect(mocks.core.setTheme).toHaveBeenCalledWith("dark");
  });

  it("toggles compact mode from the item before logout", async () => {
    const { user } = renderLayout();

    await user.click(screen.getByRole("button", { name: "account" }));
    const compactItem = await screen.findByText("compactMode");
    const logoutItem = await screen.findByText("logout");
    expect(
      compactItem.compareDocumentPosition(logoutItem) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    await user.click(compactItem);

    expect(mocks.core.setCompact).toHaveBeenCalledWith(true);
  });

  it("offers normal mode when compact mode is active", async () => {
    mocks.core.compact = true;
    const { user } = renderLayout();

    await user.click(screen.getByRole("button", { name: "account" }));
    await user.click(await screen.findByText("normalMode"));

    expect(mocks.core.setCompact).toHaveBeenCalledWith(false);
  });

  it("clears the local session even when remote logout fails", async () => {
    vi.mocked(logout).mockRejectedValueOnce(new Error("Offline"));
    const { user } = renderLayout();

    await user.click(screen.getByRole("button", { name: "account" }));
    await user.click(await screen.findByText("logout"));

    await waitFor(() => expect(clearAccessToken).toHaveBeenCalledOnce());
    expect(mocks.core.setUser).toHaveBeenLastCalledWith();
    expect(screen.getByLabelText("location")).toHaveTextContent("/auth");
  });
});
