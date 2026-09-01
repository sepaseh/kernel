import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { permissions, roles } from "@/test/storybook/fixtures";
import { StoryShell } from "@/test/storybook/StoryShell";

import { RoleForm } from "./RoleForm";

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
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(body.getByRole("button", { name: /Submit|ثبت/ }));
    await expect(body.getByLabelText(/Name|نام/)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  },
};
