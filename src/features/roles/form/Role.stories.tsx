import type { Meta, StoryObj } from "@storybook/react-vite";

import { permissions, roles } from "@/test/storybook/fixtures";
import { StoryShell } from "@/test/storybook/StoryShell";

import { RoleForm } from "./Role";

const meta = {
  component: RoleForm,
  title: "Features/Roles/RoleForm",
} satisfies Meta<typeof RoleForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {
  args: { onFinish: () => undefined, options: { permissions } },
  render: (args) => (
    <StoryShell initialEntries={["/#create"]}>
      <RoleForm {...args} />
    </StoryShell>
  ),
};

export const Update: Story = {
  args: {
    data: roles[0],
    onFinish: () => undefined,
    options: { permissions },
  },
  render: (args) => (
    <StoryShell initialEntries={["/#update"]}>
      <RoleForm {...args} />
    </StoryShell>
  ),
};
