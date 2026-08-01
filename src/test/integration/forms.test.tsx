import { waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as rolesApi from "@/features/roles/api";
import { RoleForm } from "@/features/roles/form/Role";
import * as usersApi from "@/features/users/api";
import { UserForm } from "@/features/users/forms/user/User";
import { UserPasswordForm } from "@/features/users/forms/user-password/UserPassword";
import { UserFormRole } from "@/features/users/forms/user-role/UserRole";
import { UserWorkspaceForm } from "@/features/users/forms/user-workspace/UserWorkspace";
import { UserProps } from "@/features/users/types";
import { render, screen } from "@/test/render";

const mocks = vi.hoisted(() => ({
  goBack: vi.fn(),
  messageError: vi.fn(),
  messageSuccess: vi.fn(),
}));

vi.mock("@/features/roles/api", () => ({
  createRole: vi.fn(),
  updateRole: vi.fn(),
}));

vi.mock("@/features/users/api", () => ({
  createUser: vi.fn(),
  updateUser: vi.fn(),
  updateUserPassword: vi.fn(),
  updateUserRoles: vi.fn(),
  updateUserWorkspaces: vi.fn(),
}));

const api = { ...rolesApi, ...usersApi };

vi.mock("@/app/hooks", () => ({
  useAntd: () => ({
    messageAPI: {
      error: mocks.messageError,
      success: mocks.messageSuccess,
    },
  }),
}));

vi.mock("@/shared/hooks", () => ({
  useGoBack: () => mocks.goBack,
}));

vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-i18next")>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

const userData: UserProps = {
  email: "ada@example.com",
  firstName: "Ada",
  id: "user-1",
  isSystemAdmin: false,
  lastName: "Lovelace",
  mobile: "09120000000",
  personnelCode: "1001",
  roleIds: ["role-1"],
  username: "ada",
  workspaceIds: ["workspace-1"],
};
const mismatchedCredential = "mismatched-test-credential";
const replacementCredential = "replacement-test-credential";
const syntheticCredential = "synthetic-test-credential";

const renderAtHash = (ui: React.ReactNode, hash: string) =>
  render(<MemoryRouter initialEntries={[`/${hash}`]}>{ui}</MemoryRouter>);

beforeEach(() => {
  vi.mocked(api.createRole).mockResolvedValue({
    id: "role-1",
    name: "Operators",
    permissions: ["users.read"],
  });
  vi.mocked(api.createUser).mockResolvedValue(userData);
  vi.mocked(api.updateRole).mockResolvedValue({
    id: "role-1",
    name: "Operators",
    permissions: ["users.read"],
  });
  vi.mocked(api.updateUser).mockResolvedValue(userData);
  vi.mocked(api.updateUserPassword).mockResolvedValue(undefined);
  vi.mocked(api.updateUserRoles).mockResolvedValue(undefined);
  vi.mocked(api.updateUserWorkspaces).mockResolvedValue(undefined);
});

describe("user identity form", () => {
  it("validates and creates a user", async () => {
    const onFinish = vi.fn();
    const { user } = renderAtHash(<UserForm onFinish={onFinish} />, "#create");

    await user.type(await screen.findByLabelText("firstName"), "Ada");
    await user.type(screen.getByLabelText("lastName"), "Lovelace");
    await user.type(screen.getByLabelText("mobile"), "09120000000");
    await user.type(screen.getByLabelText("personnelCode"), "1001");
    await user.type(screen.getByLabelText("password"), syntheticCredential);
    await user.type(screen.getByLabelText("confirmPass"), syntheticCredential);
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() =>
      expect(api.createUser).toHaveBeenCalledWith({
        firstName: "Ada",
        lastName: "Lovelace",
        mobile: "09120000000",
        password: syntheticCredential,
        personnelCode: "1001",
      }),
    );
    expect(mocks.messageSuccess).toHaveBeenCalledWith("userCreated");
    expect(mocks.goBack).toHaveBeenCalledOnce();
    expect(onFinish).toHaveBeenCalledOnce();
  }, 10_000);

  it("rejects mismatched user passwords", async () => {
    const { user } = renderAtHash(<UserForm onFinish={vi.fn()} />, "#create");

    await user.type(await screen.findByLabelText("firstName"), "Ada");
    await user.type(screen.getByLabelText("lastName"), "Lovelace");
    await user.type(screen.getByLabelText("mobile"), "09120000000");
    await user.type(screen.getByLabelText("personnelCode"), "1001");
    await user.type(screen.getByLabelText("password"), syntheticCredential);
    await user.type(screen.getByLabelText("confirmPass"), mismatchedCredential);
    await user.click(screen.getByRole("button", { name: "submit" }));

    expect(await screen.findByText("passsMismatch")).toBeInTheDocument();
    expect(api.createUser).not.toHaveBeenCalled();
  });

  it("updates a user without submitting password fields", async () => {
    const onFinish = vi.fn();
    const { user } = renderAtHash(
      <UserForm data={userData} onFinish={onFinish} />,
      "#update",
    );

    const firstName = await screen.findByLabelText("firstName");
    await user.clear(firstName);
    await user.type(firstName, "Augusta");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() =>
      expect(api.updateUser).toHaveBeenCalledWith("user-1", {
        firstName: "Augusta",
        lastName: "Lovelace",
        mobile: "09120000000",
        personnelCode: "1001",
      }),
    );
    expect(screen.queryByLabelText("password")).not.toBeInTheDocument();
    expect(mocks.messageSuccess).toHaveBeenCalledWith("userUpdated");
    expect(onFinish).toHaveBeenCalledOnce();
  });
});

describe("role form", () => {
  it("creates a role with selected permissions and reports failures", async () => {
    vi.mocked(api.createRole).mockRejectedValueOnce(
      new Error("Role already exists"),
    );
    const { user } = renderAtHash(
      <RoleForm
        onFinish={vi.fn()}
        options={{
          permissions: [
            {
              name: "users",
              permissions: [{ name: "users.read", title: "Read users" }],
              title: "Users",
            },
          ],
        }}
      />,
      "#create",
    );

    await user.type(await screen.findByLabelText("name"), "Operators");
    await user.click(screen.getByLabelText("Read users"));
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() =>
      expect(api.createRole).toHaveBeenCalledWith({
        name: "Operators",
        permissions: ["users.read"],
      }),
    );
    expect(mocks.messageError).toHaveBeenCalledWith("Role already exists");
  });
});

describe("user access forms", () => {
  it("updates a user's password", async () => {
    const { user } = renderAtHash(
      <UserPasswordForm data={userData} />,
      "#password",
    );

    await user.type(
      await screen.findByLabelText("newPass"),
      replacementCredential,
    );
    await user.type(
      screen.getByLabelText("confirmPass"),
      replacementCredential,
    );
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() =>
      expect(api.updateUserPassword).toHaveBeenCalledWith("user-1", {
        password: replacementCredential,
      }),
    );
    expect(mocks.messageSuccess).toHaveBeenCalledWith("passwordUpdated");
  });

  it("submits the user's current roles", async () => {
    const onFinish = vi.fn();
    const { user } = renderAtHash(
      <UserFormRole
        data={userData}
        onFinish={onFinish}
        options={{ roles: [{ id: "role-1", name: "Operators" }] }}
      />,
      "#roles",
    );

    await screen.findByText("Operators");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() =>
      expect(api.updateUserRoles).toHaveBeenCalledWith("user-1", {
        roleIds: ["role-1"],
      }),
    );
    expect(mocks.messageSuccess).toHaveBeenCalledWith("rolesUpdated");
    expect(onFinish).toHaveBeenCalledOnce();
  });

  it("submits the user's current workspaces", async () => {
    const onFinish = vi.fn();
    const { user } = renderAtHash(
      <UserWorkspaceForm
        data={userData}
        onFinish={onFinish}
        options={{
          workspaces: [{ id: "workspace-1", name: "Analytical Engine" }],
        }}
      />,
      "#workspaces",
    );

    await screen.findByText("Analytical Engine");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() =>
      expect(api.updateUserWorkspaces).toHaveBeenCalledWith("user-1", {
        workspaceIds: ["workspace-1"],
      }),
    );
    expect(mocks.messageSuccess).toHaveBeenCalledWith("workspacesUpdated");
    expect(onFinish).toHaveBeenCalledOnce();
  });
});

describe("form cancellation", () => {
  it.each([
    {
      hash: "#create",
      name: "user",
      ui: <UserForm onFinish={vi.fn()} />,
    },
    {
      hash: "#create",
      name: "role",
      ui: <RoleForm onFinish={vi.fn()} options={{ permissions: [] }} />,
    },
    {
      hash: "#password",
      name: "password",
      ui: <UserPasswordForm data={userData} />,
    },
    {
      hash: "#roles",
      name: "roles",
      ui: (
        <UserFormRole
          data={userData}
          onFinish={vi.fn()}
          options={{ roles: [] }}
        />
      ),
    },
    {
      hash: "#workspaces",
      name: "workspaces",
      ui: (
        <UserWorkspaceForm
          data={userData}
          onFinish={vi.fn()}
          options={{ workspaces: [] }}
        />
      ),
    },
  ])(
    "closes the $name form without forwarding the event",
    async ({ hash, ui }) => {
      const { user } = renderAtHash(ui, hash);

      await user.click(await screen.findByRole("button", { name: "cancel" }));

      expect(mocks.goBack).toHaveBeenLastCalledWith();
    },
  );
});
