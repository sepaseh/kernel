import type { Meta, StoryObj } from "@storybook/react-vite";
import { mocked } from "storybook/test";

import {
  sampleAccount,
  user,
  userOptions,
  users,
} from "@/test/storybook/fixtures";
import { StoryShell } from "@/test/storybook/StoryShell";

import {
  fetchUser,
  fetchUserRoleOptions,
  fetchUsers,
  fetchUserWorkspaceOptions,
} from "./api";
import { UsersPage } from "./Users";

const meta = {
  async beforeEach() {
    mocked(fetchUser).mockResolvedValue(user);
    mocked(fetchUserRoleOptions).mockResolvedValue(userOptions);
    mocked(fetchUsers).mockResolvedValue({ items: users, total: users.length });
    mocked(fetchUserWorkspaceOptions).mockResolvedValue(userOptions);
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
