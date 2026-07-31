import type { Meta, StoryObj } from "@storybook/react-vite";

import { StoryShell } from "@/test/storybook/StoryShell";

import { AccountPage } from "./Account";

const meta = {
  component: AccountPage,
  render: () => (
    <StoryShell initialEntries={["/account"]}>
      <AccountPage />
    </StoryShell>
  ),
  title: "Features/Account/Page",
} satisfies Meta<typeof AccountPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
