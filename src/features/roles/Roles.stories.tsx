import type { Meta, StoryObj } from "@storybook/react-vite";
import { mocked } from "storybook/test";

import { permissions, roles, sampleAccount } from "@/test/storybook/fixtures";
import { StoryShell } from "@/test/storybook/StoryShell";

import { fetchPermissions, fetchRole, fetchRoles } from "./api";
import { RolesPage } from "./Roles";

const meta = {
  async beforeEach() {
    mocked(fetchPermissions).mockResolvedValue(permissions);
    mocked(fetchRole).mockResolvedValue(roles[0]);
    mocked(fetchRoles).mockResolvedValue(roles);
  },
  component: RolesPage,
  render: () => (
    <StoryShell initialEntries={["/roles"]}>
      <RolesPage />
    </StoryShell>
  ),
  title: "Features/Roles/Page",
} satisfies Meta<typeof RolesPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {};

export const Empty: Story = {
  beforeEach() {
    mocked(fetchRoles).mockResolvedValue([]);
  },
};

export const Loading: Story = {
  beforeEach() {
    mocked(fetchRoles).mockReturnValue(new Promise(() => undefined));
  },
};

export const LoadError: Story = {
  beforeEach() {
    mocked(fetchRoles).mockRejectedValue(new Error("Unable to load roles"));
  },
};

export const ReadOnly: Story = {
  render: () => (
    <StoryShell
      initialEntries={["/roles"]}
      initialUser={{
        ...sampleAccount,
        isSystemAdmin: false,
        permissions: ["roles.read"],
      }}
    >
      <RolesPage />
    </StoryShell>
  ),
};
