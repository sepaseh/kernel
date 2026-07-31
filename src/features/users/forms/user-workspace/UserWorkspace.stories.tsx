import type { Meta, StoryObj } from "@storybook/react-vite";

import { user, userOptions } from "@/test/storybook/fixtures";
import { StoryShell } from "@/test/storybook/StoryShell";

import { UserWorkspaceForm } from "./UserWorkspace";

const meta = {
  args: {
    data: user,
    onFinish: () => undefined,
    options: { workspaces: userOptions },
  },
  component: UserWorkspaceForm,
  render: (args) => (
    <StoryShell initialEntries={["/#workspaces"]}>
      <UserWorkspaceForm {...args} />
    </StoryShell>
  ),
  title: "Features/Users/UserWorkspaceForm",
} satisfies Meta<typeof UserWorkspaceForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
