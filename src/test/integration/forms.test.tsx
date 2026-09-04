import { waitFor } from "@testing-library/react";
import type * as ReactI18next from "react-i18next";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as rolesApi from "@/features/roles/api";
import { RoleForm } from "@/features/roles/components/role-form/RoleForm";
import * as usersApi from "@/features/users/api";
import { UserForm } from "@/features/users/components/user-form/UserForm";
import { UserRoleForm } from "@/features/users/components/user-role-form/UserRoleForm";
import type { User } from "@/features/users/types";
import { render, screen } from "@/test/render";

const mocks = vi.hoisted(() => ({
  goBack: vi.fn(),
  messageError: vi.fn(),
  messageSuccess: vi.fn(),
  notificationSuccess: vi.fn(),
}));

vi.mock("@/features/roles/api", () => ({
  createRole: vi.fn(),
  updateRole: vi.fn(),
}));

vi.mock("@/features/users/api", () => ({
  createUser: vi.fn(),
  updateUser: vi.fn(),
  updateUserRoles: vi.fn(),
}));

const api = { ...rolesApi, ...usersApi };

vi.mock("@/app/hooks", () => ({
  useAntd: () => ({
    messageAPI: {
      error: mocks.messageError,
      success: mocks.messageSuccess,
    },
    notificationAPI: { success: mocks.notificationSuccess },
  }),
}));

vi.mock("@/shared/hooks", () => ({
  useGoBack: () => mocks.goBack,
}));

vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<typeof ReactI18next>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

const userData: User = {
  email: "ada@example.com",
  firstName: "Ada",
  id: "user-1",
  isSystemAdmin: false,
  lastName: "Lovelace",
  mobile: "09120000000",
  roles: [{ id: "role-1", name: "Operators" }],
  status: "active",
  username: "ada",
};
const renderAtHash = (ui: React.ReactNode, hash: string) =>
  render(<MemoryRouter initialEntries={[`/${hash}`]}>{ui}</MemoryRouter>);

const findFocusedField = async (name: string) => {
  const field = await screen.findByLabelText(name);
  await waitFor(() => expect(field).toHaveFocus());
  return field;
};

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
  vi.mocked(api.updateUserRoles).mockResolvedValue(undefined);
});

describe("user identity form", () => {
  it("validates and creates a user", async () => {
    const onFinish = vi.fn();
    const { user } = renderAtHash(<UserForm onFinish={onFinish} />, "#create");

    await user.type(await findFocusedField("firstName"), "Ada");
    await user.type(screen.getByLabelText("lastName"), "Lovelace");
    await user.type(screen.getByLabelText("mobile"), "09120000000");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => expect(api.createUser).toHaveBeenCalledOnce());
    const password = vi.mocked(api.createUser).mock.calls[0][0].password;
    expect(api.createUser).toHaveBeenCalledWith({
      firstName: "Ada",
      lastName: "Lovelace",
      mobile: "09120000000",
      password,
    });
    expect(mocks.notificationSuccess).toHaveBeenCalledWith({
      description: password,
      message: "password",
    });
    expect(mocks.messageSuccess).toHaveBeenCalledWith("userCreated");
    expect(mocks.goBack).toHaveBeenCalledOnce();
    expect(onFinish).toHaveBeenCalledOnce();
  }, 10_000);

  it("requires the user identity fields before generating a password", async () => {
    const { user } = renderAtHash(<UserForm onFinish={vi.fn()} />, "#create");

    await findFocusedField("firstName");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() =>
      expect(screen.getAllByText(/required/i)).toHaveLength(3),
    );
    expect(api.createUser).not.toHaveBeenCalled();
    expect(mocks.notificationSuccess).not.toHaveBeenCalled();
  });

  it("updates a user without generating a new password", async () => {
    const onFinish = vi.fn();
    const { user } = renderAtHash(
      <UserForm data={userData} onFinish={onFinish} />,
      "#update",
    );

    const firstName = await findFocusedField("firstName");
    await user.clear(firstName);
    await user.type(firstName, "Augusta");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() =>
      expect(api.updateUser).toHaveBeenCalledWith("user-1", {
        firstName: "Augusta",
        lastName: "Lovelace",
        mobile: "09120000000",
      }),
    );
    expect(mocks.notificationSuccess).not.toHaveBeenCalled();
    expect(mocks.messageSuccess).toHaveBeenCalledWith("userUpdated");
    expect(onFinish).toHaveBeenCalledOnce();
  });

  it("keeps the user form open and reports creation failures", async () => {
    vi.mocked(api.createUser).mockRejectedValueOnce(
      new Error("Mobile already exists"),
    );
    const onFinish = vi.fn();
    const { user } = renderAtHash(<UserForm onFinish={onFinish} />, "#create");

    await user.type(await findFocusedField("firstName"), "Ada");
    await user.type(screen.getByLabelText("lastName"), "Lovelace");
    await user.type(screen.getByLabelText("mobile"), "09120000000");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() =>
      expect(mocks.messageError).toHaveBeenCalledWith("Mobile already exists"),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(mocks.notificationSuccess).not.toHaveBeenCalled();
    expect(mocks.goBack).not.toHaveBeenCalled();
    expect(onFinish).not.toHaveBeenCalled();
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

    await user.type(await findFocusedField("name"), "Operators");
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

  it("prefills and updates an existing role", async () => {
    const onFinish = vi.fn();
    const { user } = renderAtHash(
      <RoleForm
        data={{
          id: "role-1",
          name: "Operators",
          permissions: ["users.read"],
        }}
        onFinish={onFinish}
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
      "#update",
    );

    const name = await findFocusedField("name");
    expect(name).toHaveValue("Operators");
    expect(screen.getByLabelText("Read users")).toBeChecked();
    await user.clear(name);
    await user.type(name, "Administrators");
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() =>
      expect(api.updateRole).toHaveBeenCalledWith("role-1", {
        name: "Administrators",
        permissions: ["users.read"],
      }),
    );
    expect(mocks.messageSuccess).toHaveBeenCalledWith("roleUpdated");
    expect(mocks.goBack).toHaveBeenCalledOnce();
    expect(onFinish).toHaveBeenCalledOnce();
  });
});

describe("user access forms", () => {
  it("submits the user's current roles", async () => {
    const onFinish = vi.fn();
    const { user } = renderAtHash(
      <UserRoleForm
        data={userData}
        onFinish={onFinish}
        options={{
          roles: [{ id: "role-1", name: "Operators", permissions: [] }],
        }}
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
});

describe("form data guards", () => {
  it.each([
    {
      hash: "#update",
      name: "user",
      ui: <UserForm onFinish={vi.fn()} />,
    },
    {
      hash: "#update",
      name: "role",
      ui: <RoleForm onFinish={vi.fn()} options={{ permissions: [] }} />,
    },
    {
      hash: "#roles",
      name: "roles",
      ui: <UserRoleForm onFinish={vi.fn()} options={{ roles: [] }} />,
    },
  ])(
    "closes the $name form when its record is missing",
    async ({ hash, ui }) => {
      renderAtHash(ui, hash);

      await waitFor(() => expect(mocks.goBack).toHaveBeenCalledOnce());
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    },
  );
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
      hash: "#roles",
      name: "roles",
      ui: (
        <UserRoleForm
          data={userData}
          onFinish={vi.fn()}
          options={{ roles: [] }}
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
