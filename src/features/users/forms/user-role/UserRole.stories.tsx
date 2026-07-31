import type { Meta, StoryObj } from "@storybook/react-vite";

import { user, userOptions } from "@/test/storybook/fixtures";
import { StoryShell } from "@/test/storybook/StoryShell";

import { UserFormRole } from "./UserRole";

const meta = {
  args: {
    data: user,
    onFinish: () => undefined,
    options: { roles: userOptions },
  },
  component: UserFormRole,
  render: (args) => (
    <StoryShell initialEntries={["/#roles"]}>
      <UserFormRole {...args} />
    </StoryShell>
  ),
  title: "Features/Users/UserRoleForm",
} satisfies Meta<typeof UserFormRole>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
