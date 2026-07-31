import { within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/api";
import { render, screen } from "@/test/render";

import { AccountPage } from "./account";
import { ForgotPassPage } from "./forgot-pass";
import { LoginPage } from "./login";
import { RegisterPage } from "./register";
import { RolesPage } from "./roles";
import { UsersPage } from "./users";

const mocks = vi.hoisted(() => {
  const account = {
    email: "ada@example.com",
    firstName: "Ada",
    id: "user-1",
    isSystemAdmin: false,
    lastName: "Lovelace",
    mobile: "09120000000",
    permissions: [],
    personnelCode: "1001",
    status: "active",
    username: "ada",
  };
  const messageError = vi.fn();
  const messageSuccess = vi.fn();
  const modalConfirm = vi.fn();
  const setFilters = vi.fn();
  const setUser = vi.fn();

  return {
    actionPermissions: {
      canCreateRoles: false,
      canCreateUsers: false,
      canDeleteRoles: false,
      canDeleteUsers: false,
      canUpdateRoles: false,
      canUpdateUsers: false,
    },
    account,
    antd: {
      messageAPI: {
        error: messageError,
        success: messageSuccess,
      },
      modalAPI: { confirm: modalConfirm },
    },
    core: {
      setUser,
      user: account,
    },
    filterState: {
      filters: {},
      setFilters,
    },
    messageError,
    messageSuccess,
    modalConfirm,
    setFilters,
    setUser,
  };
});

vi.mock("@/api", () => ({
  changePassword: vi.fn(),
  deleteRole: vi.fn(),
  deleteUser: vi.fn(),
  fetchPermissions: vi.fn(),
  fetchRole: vi.fn(),
  fetchRoles: vi.fn(),
  fetchUser: vi.fn(),
  fetchUserRoleOptions: vi.fn(),
  fetchUsers: vi.fn(),
  fetchUserWorkspaceOptions: vi.fn(),
  forgotPassword: vi.fn(),
  getAccount: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  requestEmailVerification: vi.fn(),
  requestOtp: vi.fn(),
  updateProfile: vi.fn(),
  updateUsername: vi.fn(),
  updateUserStatus: vi.fn(),
  updateUserSystemAdmin: vi.fn(),
  verifyEmail: vi.fn(),
}));

vi.mock("@/forms/role", () => ({ RoleForm: () => null }));
vi.mock("@/forms/user", () => ({ UserForm: () => null }));
vi.mock("@/forms/user-password", () => ({ UserPasswordForm: () => null }));
vi.mock("@/forms/user-role", () => ({ UserFormRole: () => null }));
vi.mock("@/forms/user-workspace", () => ({ UserWorkspaceForm: () => null }));

vi.mock("@/hooks", () => ({
  useActionPermissions: () => mocks.actionPermissions,
  useAntd: () => mocks.antd,
  useCore: () => mocks.core,
  useFilterParams: () => mocks.filterState,
}));

vi.mock("antd-style", () => ({
  useAntdToken: () => ({
    colorSuccess: "#00aa00",
    marginMD: 16,
    marginXS: 8,
    paddingMD: 16,
    paddingSM: 8,
    screenMD: 768,
    screenXL: 1200,
  }),
}));

vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-i18next")>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

const Location = () => {
  const location = useLocation();
  return <output aria-label="location">{location.pathname}</output>;
};

const renderPage = (page: React.ReactNode) =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      {page}
      <Location />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.mocked(api.login).mockResolvedValue({
    accessToken: "access-token",
  });
  vi.mocked(api.requestOtp).mockResolvedValue({
    expiresIn: 300,
    remainingSeconds: 60,
  });
  vi.mocked(api.updateProfile).mockResolvedValue(mocks.account);
  vi.mocked(api.fetchRoles).mockResolvedValue([]);
  vi.mocked(api.fetchUsers).mockResolvedValue({ items: [], total: 0 });
});

describe("priority pages", () => {
  it("submits login credentials and navigates home", async () => {
    const { user } = renderPage(<LoginPage />);

    await user.type(screen.getByLabelText("identifier"), "ada");
    await user.type(screen.getByLabelText("password"), "secret");
    await user.click(screen.getByRole("button", { name: "enter" }));

    expect(api.login).toHaveBeenCalledWith({
      identifier: "ada",
      password: "secret",
    });
    expect(screen.getByLabelText("location")).toHaveTextContent("/");
  });

  it("requests a password-recovery OTP for the entered mobile", async () => {
    const { user } = renderPage(<ForgotPassPage />);

    await user.type(screen.getByLabelText("mobile"), "09120000000");
    await user.click(screen.getByRole("button", { name: "requestOtp" }));

    expect(api.requestOtp).toHaveBeenCalledWith({
      mobile: "09120000000",
      purpose: "forgot_password",
    });
    expect(mocks.messageSuccess).toHaveBeenCalledWith("otpSent");
  });

  it("requests a registration OTP for the entered mobile", async () => {
    const { user } = renderPage(<RegisterPage />);

    await user.type(screen.getByLabelText("mobile"), "09120000000");
    await user.click(screen.getByRole("button", { name: "requestOtp" }));

    expect(api.requestOtp).toHaveBeenCalledWith({
      mobile: "09120000000",
      purpose: "register",
    });
    expect(mocks.messageSuccess).toHaveBeenCalledWith("otpSent");
  });

  it("updates the account profile", async () => {
    const updatedAccount = { ...mocks.account, firstName: "Augusta" };
    vi.mocked(api.updateProfile).mockResolvedValue(updatedAccount);
    const { user } = renderPage(<AccountPage />);
    const firstName = screen.getByLabelText("firstName");
    const profileForm = firstName.closest("form");

    expect(profileForm).not.toBeNull();
    await user.clear(firstName);
    await user.type(firstName, "Augusta");
    await user.click(
      within(profileForm!).getByRole("button", { name: "update" }),
    );

    expect(api.updateProfile).toHaveBeenCalledWith({
      firstName: "Augusta",
      lastName: "Lovelace",
      personnelCode: "1001",
    });
    expect(mocks.setUser).toHaveBeenCalledWith(updatedAccount);
    expect(mocks.messageSuccess).toHaveBeenCalledWith("profileUpdated");
  });

  it("loads and displays roles", async () => {
    vi.mocked(api.fetchRoles).mockResolvedValue([
      {
        id: "role-1",
        name: "Operators",
        permissions: ["users.read", "users.update"],
      },
    ]);

    renderPage(<RolesPage />);

    expect(await screen.findByText("Operators")).toBeInTheDocument();
    expect(api.fetchRoles).toHaveBeenCalledOnce();
  });

  it("loads and displays users", async () => {
    vi.mocked(api.fetchUsers).mockResolvedValue({
      items: [
        {
          email: "ada@example.com",
          firstName: "Ada",
          id: "user-1",
          isSystemAdmin: false,
          lastName: "Lovelace",
          mobile: "09120000000",
          personnelCode: "1001",
          status: "active",
          username: "ada",
        },
      ],
      total: 1,
    });

    renderPage(<UsersPage />);

    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    expect(api.fetchUsers).toHaveBeenCalledWith({
      offset: "0",
      size: "12",
    });
  });
});
