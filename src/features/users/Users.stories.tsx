import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, mocked, userEvent, within } from "storybook/test";

import { fetchRoles } from "@/features/roles";
import { roles, sampleAccount, user, users } from "@/test/storybook/fixtures";
import { StoryShell } from "@/test/storybook/StoryShell";

import { fetchUser, fetchUsers, updateUserPassword } from "./api";
import { UsersPage } from "./Users";

const meta = {
  async beforeEach() {
    mocked(fetchUser).mockResolvedValue(user);
    mocked(fetchRoles).mockResolvedValue(roles);
    mocked(fetchUsers).mockResolvedValue({ items: users, total: users.length });
    mocked(updateUserPassword).mockResolvedValue(undefined);
  },
  component: UsersPage,
  render: () => (
    <StoryShell initialEntries={["/users"]}>
      <UsersPage />
    </StoryShell>
  ),
  title: "Features/Users/Page",
} satisfies Meta<typeof UsersPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {};

export const Empty: Story = {
  beforeEach() {
    mocked(fetchUsers).mockResolvedValue({ items: [], total: 0 });
  },
};

export const Loading: Story = {
  beforeEach() {
    mocked(fetchUsers).mockReturnValue(new Promise(() => undefined));
  },
};

export const LoadError: Story = {
  beforeEach() {
    mocked(fetchUsers).mockRejectedValue(new Error("Unable to load users"));
  },
};

export const PasswordConfirmation: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      body.getAllByRole("button", { name: /Password|رمز عبور/ })[0],
    );

    await expect(body.getByRole("dialog")).toBeInTheDocument();
  },
};

export const ReadOnly: Story = {
  render: () => (
    <StoryShell
      initialEntries={["/users"]}
      initialUser={{
        ...sampleAccount,
        isSystemAdmin: false,
        permissions: ["users.read"],
      }}
    >
      <UsersPage />
    </StoryShell>
  ),
};
