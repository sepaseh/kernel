import type { Meta, StoryObj } from "@storybook/react-vite";

import { user, userOptions } from "@/test/storybook/fixtures";
import { StoryShell } from "@/test/storybook/StoryShell";

import { UserRoleForm } from "./UserRoleForm";

const meta = {
  args: {
    data: user,
    onFinish: () => undefined,
    options: { roles: userOptions },
  },
  component: UserRoleForm,
  render: (args) => (
    <StoryShell initialEntries={["/#roles"]}>
      <UserRoleForm {...args} />
    </StoryShell>
  ),
  title: "Features/Users/UserRoleForm",
} satisfies Meta<typeof UserRoleForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
