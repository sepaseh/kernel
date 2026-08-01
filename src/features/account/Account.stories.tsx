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

export const WithoutAuthenticatedUser: Story = {
  render: () => (
    <StoryShell initialEntries={["/account"]} initialUser={null}>
      <AccountPage />
    </StoryShell>
  ),
};

export const DarkRtl: Story = {
  globals: { direction: "rtl", theme: "dark" },
  render: () => (
    <StoryShell
      initialEntries={["/account"]}
      initialLanguage="fa"
      initialTheme="dark"
    >
      <AccountPage />
    </StoryShell>
  ),
};
