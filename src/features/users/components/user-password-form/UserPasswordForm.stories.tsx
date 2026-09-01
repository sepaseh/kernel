import type { Meta, StoryObj } from "@storybook/react-vite";

import { user } from "@/test/storybook/fixtures";
import { StoryShell } from "@/test/storybook/StoryShell";

import { UserPasswordForm } from "./UserPasswordForm";

const meta = {
  args: { data: user },
  component: UserPasswordForm,
  render: (args) => (
    <StoryShell initialEntries={["/#password"]}>
      <UserPasswordForm {...args} />
    </StoryShell>
  ),
  title: "Features/Users/UserPasswordForm",
} satisfies Meta<typeof UserPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
