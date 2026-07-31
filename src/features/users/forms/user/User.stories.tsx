import type { Meta, StoryObj } from "@storybook/react-vite";

import { user } from "@/test/storybook/fixtures";
import { StoryShell } from "@/test/storybook/StoryShell";

import { UserForm } from "./User";

const meta = {
  component: UserForm,
  title: "Features/Users/UserForm",
} satisfies Meta<typeof UserForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {
  args: { onFinish: () => undefined },
  render: (args) => (
    <StoryShell initialEntries={["/#create"]}>
      <UserForm {...args} />
    </StoryShell>
  ),
};

export const Update: Story = {
  args: { data: user, onFinish: () => undefined },
  render: (args) => (
    <StoryShell initialEntries={["/#update"]}>
      <UserForm {...args} />
    </StoryShell>
  ),
};
