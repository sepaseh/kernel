import { waitFor, within } from "@testing-library/react";
import type * as ReactI18next from "react-i18next";
import { MemoryRouter, useLocation } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccountPage } from "@/features/account";
import * as accountApi from "@/features/account/api";
import * as authApi from "@/features/auth/api";
import { ForgotPassPage } from "@/features/forgot-pass";
import { LoginPage } from "@/features/login";
import { RegisterPage } from "@/features/register";
import { RolesPage } from "@/features/roles";
import * as rolesApi from "@/features/roles/api";
import type { Role } from "@/features/roles/types";
import { UsersPage } from "@/features/users";
import * as usersApi from "@/features/users/api";
import { render, screen } from "@/test/render";

const mocks = vi.hoisted(() => {
  const account = {
    email: "ada@example.com",
    firstName: "Ada",
    id: "user-1",
    isSystemAdmin: false,
    lastName: "Lovelace",
    mobile: "09120000000",
    permissions: [],
    status: "active",
    username: "ada",
  };
  const messageError = vi.fn();
  const messageSuccess = vi.fn();
  const modalConfirm = vi.fn();
  const notificationSuccess = vi.fn();
  const setFilters = vi.fn();
  const setUser = vi.fn();
  const writeClipboard = vi.fn();

  return {
    routePermissions: {
      roles: {
        canCreate: false,
        canDelete: false,
        canUpdate: false,
      },
      users: {
        canCreate: false,
        canDelete: false,
        canUpdate: false,
      },
    },
    account,
    antd: {
      messageAPI: {
        error: messageError,
        success: messageSuccess,
      },
      modalAPI: { confirm: modalConfirm },
      notificationAPI: { success: notificationSuccess },
    },
    core: {
      logos: { dark: "/dark-logo.svg", light: "/light-logo.svg" },
      setUser,
      theme: "light" as const,
      user: account as typeof account | undefined,
    },
    filterState: {
      filters: {},
      setFilters,
    },
    messageError,
    messageSuccess,
    modalConfirm,
    notificationSuccess,
    setFilters,
    setUser,
    writeClipboard,
  };
});

vi.mock("@/features/account/api", () => ({
  getAccount: vi.fn(),
  requestEmailVerification: vi.fn(),
  updateProfile: vi.fn(),
  updateUsername: vi.fn(),
  verifyEmail: vi.fn(),
}));

vi.mock("@/features/auth/api", () => ({
  changePassword: vi.fn(),
  forgotPassword: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  requestOtp: vi.fn(),
}));

vi.mock("@/features/roles/api", () => ({
  deleteRole: vi.fn(),
  fetchPermissions: vi.fn(),
  fetchRole: vi.fn(),
  fetchRoles: vi.fn(),
}));

vi.mock("@/features/users/api", () => ({
  deleteUser: vi.fn(),
  fetchUser: vi.fn(),
  fetchUsers: vi.fn(),
  updateUserPassword: vi.fn(),
  updateUserStatus: vi.fn(),
  updateUserSystemAdmin: vi.fn(),
}));

const api = { ...accountApi, ...authApi, ...rolesApi, ...usersApi };

vi.mock("@/features/roles/components/role-form/RoleForm", () => ({
  RoleForm: () => null,
}));
vi.mock("@/features/users/components/user-form/UserForm", () => ({
  UserForm: () => null,
}));
vi.mock("@/features/users/components/user-role-form/UserRoleForm", () => ({
  UserRoleForm: () => null,
}));

vi.mock("@/app/hooks", () => ({
  useAntd: () => mocks.antd,
  useCore: () => mocks.core,
}));

vi.mock("@/app/lib", () => ({
  getRoutePermissions: (route: keyof typeof mocks.routePermissions) =>
    mocks.routePermissions[route],
}));

vi.mock("@/shared/hooks", () => ({
  useFilterParams: () => mocks.filterState,
}));

vi.mock("antd-style", () => ({
  createStyles: () => () => ({ styles: { input: "login-input" } }),
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
  ...(await importOriginal<typeof ReactI18next>()),
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
  vi.clearAllMocks();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: mocks.writeClipboard },
  });
  Object.assign(mocks.routePermissions.roles, {
    canCreate: false,
    canDelete: false,
    canUpdate: false,
  });
  Object.assign(mocks.routePermissions.users, {
    canCreate: false,
    canDelete: false,
    canUpdate: false,
  });
  mocks.core.user = mocks.account;
  mocks.writeClipboard.mockResolvedValue(undefined);
  vi.mocked(api.deleteUser).mockResolvedValue(undefined);
  vi.mocked(api.fetchRoles).mockResolvedValue([]);
  vi.mocked(api.changePassword).mockResolvedValue(undefined);
  vi.mocked(api.forgotPassword).mockResolvedValue(undefined);
  vi.mocked(api.getAccount).mockResolvedValue(mocks.account);
  vi.mocked(api.login).mockResolvedValue({
    accessToken: "access-token",
  });
  vi.mocked(api.requestOtp).mockResolvedValue({
    expiresIn: 300,
    remainingSeconds: 60,
  });
  vi.mocked(api.register).mockResolvedValue({ accessToken: "access-token" });
  vi.mocked(api.requestEmailVerification).mockResolvedValue({
    expiresIn: 300,
    remainingSeconds: 60,
  });
  vi.mocked(api.updateProfile).mockResolvedValue(mocks.account);
  vi.mocked(api.updateUsername).mockResolvedValue(mocks.account);
  vi.mocked(api.updateUserPassword).mockResolvedValue(undefined);
  vi.mocked(api.updateUserStatus).mockResolvedValue(undefined);
  vi.mocked(api.updateUserSystemAdmin).mockResolvedValue(undefined);
  vi.mocked(api.verifyEmail).mockResolvedValue(undefined);
  vi.mocked(api.fetchRoles).mockResolvedValue([]);
  vi.mocked(api.fetchUsers).mockResolvedValue({ items: [], total: 0 });
});

describe("authentication pages", () => {
  it("submits login credentials and navigates home", async () => {
    const { user } = renderPage(<LoginPage />);

    expect(screen.getByRole("img", { name: "logo" })).toHaveAttribute(
      "src",
      "/light-logo.svg",
    );
    await user.type(screen.getByLabelText("identifier"), "ada");
    await user.type(screen.getByLabelText("password"), "secret");
    await user.click(screen.getByRole("button", { name: "enter" }));

    expect(api.login).toHaveBeenCalledWith({
      identifier: "ada",
      password: "secret",
    });
    expect(screen.getByLabelText("location")).toHaveTextContent("/");
  });

  it("reports rejected login credentials without navigating", async () => {
    vi.mocked(api.login).mockRejectedValueOnce(new Error("Invalid login"));
    const { user } = renderPage(<LoginPage />);

    await user.type(screen.getByLabelText("identifier"), "ada");
    await user.type(screen.getByLabelText("password"), "incorrect");
    await user.click(screen.getByRole("button", { name: "enter" }));

    await waitFor(() =>
      expect(mocks.messageError).toHaveBeenCalledWith("Invalid login"),
    );
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

  it("completes password recovery", async () => {
    const { user } = renderPage(<ForgotPassPage />);

    await user.type(screen.getByLabelText("mobile"), "09120000000");
    await user.type(screen.getByLabelText("OTP Input 1"), "123456");
    await user.type(screen.getByLabelText("newPass"), "replacement-pass");
    await user.type(screen.getByLabelText("confirmPass"), "replacement-pass");
    await user.click(screen.getByRole("button", { name: "submit" }));

    expect(api.forgotPassword).toHaveBeenCalledWith({
      mobile: "09120000000",
      otp: "123456",
      password: "replacement-pass",
    });
    expect(mocks.messageSuccess).toHaveBeenCalledWith("passwordReset");
    expect(screen.getByLabelText("location")).toHaveTextContent("/");
  });

  it("registers a verified user", async () => {
    const { user } = renderPage(<RegisterPage />);

    await user.type(screen.getByLabelText("firstName"), "Ada");
    await user.type(screen.getByLabelText("lastName"), "Lovelace");
    await user.type(screen.getByLabelText("mobile"), "09120000000");
    await user.type(screen.getByLabelText("OTP Input 1"), "123456");
    await user.type(screen.getByLabelText("password"), "registration-pass");
    await user.type(screen.getByLabelText("confirmPass"), "registration-pass");
    await user.click(screen.getByRole("button", { name: "register" }));

    expect(api.register).toHaveBeenCalledWith({
      firstName: "Ada",
      lastName: "Lovelace",
      mobile: "09120000000",
      otp: "123456",
      password: "registration-pass",
    });
    expect(screen.getByLabelText("location")).toHaveTextContent("/");
  });
});

describe("account page", () => {
  it("renders nothing until an account is available", () => {
    mocks.core.user = undefined;

    renderPage(<AccountPage />);

    expect(screen.queryByRole("heading", { name: "account" })).toBeNull();
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
    });
    expect(mocks.setUser).toHaveBeenCalledWith(updatedAccount);
    expect(mocks.messageSuccess).toHaveBeenCalledWith("profileUpdated");
  });

  it("updates the account username", async () => {
    const updatedAccount = { ...mocks.account, username: "augusta" };
    vi.mocked(api.updateUsername).mockResolvedValue(updatedAccount);
    const { user } = renderPage(<AccountPage />);

    const username = screen.getByLabelText("username");
    await user.clear(username);
    await user.type(username, "augusta");
    await user.click(
      within(username.closest("form")!).getByRole("button", { name: "update" }),
    );

    expect(api.updateUsername).toHaveBeenCalledWith({ username: "augusta" });
    expect(mocks.setUser).toHaveBeenCalledWith(updatedAccount);
  });

  it("verifies a replacement account email", async () => {
    const updatedAccount = {
      ...mocks.account,
      email: "augusta@example.com",
    };
    vi.mocked(api.getAccount).mockResolvedValue(updatedAccount);
    const { user } = renderPage(<AccountPage />);
    const email = screen.getByLabelText("email");

    await user.clear(email);
    await user.type(email, "augusta@example.com");
    await user.click(screen.getByRole("button", { name: "requestOtp" }));
    await user.type(screen.getByLabelText("OTP Input 1"), "123456");
    await user.click(screen.getByRole("button", { name: "verifyEmail" }));

    expect(api.requestEmailVerification).toHaveBeenCalledWith({
      email: "augusta@example.com",
    });
    expect(api.verifyEmail).toHaveBeenCalledWith({
      email: "augusta@example.com",
      otp: "123456",
    });
    expect(mocks.setUser).toHaveBeenCalledWith(updatedAccount);
  });

  it("changes the account password", async () => {
    const { user } = renderPage(<AccountPage />);

    await user.type(screen.getByLabelText("currentPass"), "current-pass");
    await user.type(screen.getByLabelText("newPass"), "new-password");
    await user.type(screen.getByLabelText("confirmPass"), "new-password");
    await user.click(screen.getByRole("button", { name: "changePassword" }));

    expect(api.changePassword).toHaveBeenCalledWith({
      currentPassword: "current-pass",
      newPassword: "new-password",
    });
  });

  it("reports profile update failures without replacing the account", async () => {
    vi.mocked(api.updateProfile).mockRejectedValueOnce(
      new Error("Profile unavailable"),
    );
    const { user } = renderPage(<AccountPage />);
    const firstName = screen.getByLabelText("firstName");

    await user.clear(firstName);
    await user.type(firstName, "Augusta");
    await user.click(
      within(firstName.closest("form")!).getByRole("button", {
        name: "update",
      }),
    );

    await waitFor(() =>
      expect(mocks.messageError).toHaveBeenCalledWith("Profile unavailable"),
    );
    expect(mocks.setUser).not.toHaveBeenCalled();
  });
});

describe("roles page", () => {
  it("reports a failure to load roles", async () => {
    vi.mocked(api.fetchRoles).mockRejectedValueOnce(
      new Error("Roles unavailable"),
    );

    renderPage(<RolesPage />);

    await waitFor(() =>
      expect(mocks.messageError).toHaveBeenCalledWith("Roles unavailable"),
    );
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

  it("updates and deletes roles when permitted", async () => {
    Object.assign(mocks.routePermissions.roles, {
      canCreate: true,
      canDelete: true,
      canUpdate: true,
    });
    const role: Role = {
      id: "role-1",
      name: "Operators",
      permissions: ["users.read"],
    };
    vi.mocked(api.fetchRoles).mockResolvedValue([role]);
    vi.mocked(api.fetchRole).mockResolvedValue(role);
    vi.mocked(api.fetchPermissions).mockResolvedValue([]);
    vi.mocked(api.deleteRole).mockResolvedValue(undefined);
    const { user } = renderPage(<RolesPage />);

    await screen.findByText("Operators");
    await user.click(screen.getByRole("button", { name: "update" }));

    expect(api.fetchRole).toHaveBeenCalledWith("role-1");
    expect(screen.getByLabelText("location")).toHaveTextContent("/");

    await user.click(screen.getByRole("button", { name: "delete" }));
    const confirmation = mocks.modalConfirm.mock.calls.at(-1)?.[0] as {
      onOk: () => Promise<void>;
    };
    await confirmation.onOk();

    expect(api.deleteRole).toHaveBeenCalledWith("role-1");
    expect(mocks.messageSuccess).toHaveBeenCalledWith("roleDeleted");
    expect(api.fetchRoles).toHaveBeenCalledTimes(2);
  });
});

describe("users page", () => {
  it("reports a failure to load users", async () => {
    vi.mocked(api.fetchUsers).mockRejectedValueOnce(
      new Error("Users unavailable"),
    );

    renderPage(<UsersPage />);

    await waitFor(() =>
      expect(mocks.messageError).toHaveBeenCalledWith("Users unavailable"),
    );
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
          roles: [],
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

  it("manages users when permitted", { timeout: 15_000 }, async () => {
    Object.assign(mocks.routePermissions.users, {
      canCreate: true,
      canDelete: true,
      canUpdate: true,
    });
    mocks.core.user = { ...mocks.account, isSystemAdmin: true };
    const userRecord = {
      email: "ada@example.com",
      firstName: "Ada",
      id: "user-1",
      isSystemAdmin: false,
      lastName: "Lovelace",
      mobile: "09120000000",
      roles: [],
      status: "active" as const,
      username: "ada",
    };
    vi.mocked(api.fetchUsers).mockResolvedValue({
      items: [userRecord],
      total: 1,
    });
    vi.mocked(api.fetchUser).mockResolvedValue(userRecord);
    const { user } = renderPage(<UsersPage />);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: mocks.writeClipboard },
    });

    await screen.findByText("Ada Lovelace");
    await user.click(screen.getByRole("button", { name: "update" }));
    expect(api.fetchUser).toHaveBeenCalledWith("user-1");

    await user.click(screen.getByRole("button", { name: "active" }));
    let confirmation = mocks.modalConfirm.mock.calls.at(-1)?.[0] as {
      onOk: () => Promise<void>;
    };
    await confirmation.onOk();
    expect(api.updateUserStatus).toHaveBeenCalledWith("user-1", {
      status: "inactive",
    });

    await user.click(
      within(screen.getByRole("row", { name: /Ada Lovelace/ })).getByRole(
        "button",
        { name: "no" },
      ),
    );
    confirmation = mocks.modalConfirm.mock.calls.at(-1)?.[0] as {
      onOk: () => Promise<void>;
    };
    await confirmation.onOk();
    expect(api.updateUserSystemAdmin).toHaveBeenCalledWith("user-1", {
      isSystemAdmin: true,
    });

    const randomValues = vi
      .spyOn(crypto, "getRandomValues")
      .mockImplementation((values) => {
        new Uint8Array(values.buffer).set([18, 0, 0, 0, 0, 0]);

        return values;
      });
    await user.click(screen.getByRole("button", { name: "password" }));
    confirmation = mocks.modalConfirm.mock.calls.at(-1)?.[0] as {
      cancelText: string;
      okText: string;
      okType: string;
      onOk: () => Promise<void>;
      title: string;
    };
    expect(confirmation).toMatchObject({
      cancelText: "no",
      okText: "yes",
      okType: "default",
      title: "passwordConfirm",
    });
    await confirmation.onOk();
    expect(api.updateUserPassword).toHaveBeenCalledWith("user-1", {
      password: "i00000",
    });
    expect(mocks.writeClipboard).toHaveBeenCalledWith("i00000");
    expect(mocks.notificationSuccess).toHaveBeenCalledWith({
      description: "i00000",
      message: "password",
    });
    randomValues.mockRestore();

    await user.click(screen.getByRole("button", { name: "delete" }));
    confirmation = mocks.modalConfirm.mock.calls.at(-1)?.[0] as {
      onOk: () => Promise<void>;
    };
    await confirmation.onOk();
    expect(api.deleteUser).toHaveBeenCalledWith("user-1");
  });
});
