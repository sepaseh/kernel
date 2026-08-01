import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

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

export const ValidationErrors: Story = {
  args: { onFinish: () => undefined, options: { permissions } },
  render: (args) => (
    <StoryShell initialEntries={["/#create"]}>
      <RoleForm {...args} />
    </StoryShell>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await expect(canvas.getByText("Please enter Name")).toBeVisible();
  },
};
