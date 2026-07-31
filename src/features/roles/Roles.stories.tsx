import type { Meta, StoryObj } from "@storybook/react-vite";
import { mocked } from "storybook/test";

import { permissions, roles } from "@/test/storybook/fixtures";
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
