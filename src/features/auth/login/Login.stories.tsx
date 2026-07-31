import type { Meta, StoryObj } from "@storybook/react-vite";

import { StoryShell } from "@/test/storybook/StoryShell";

import { LoginPage } from "./Login";

const meta = {
  component: LoginPage,
  decorators: [
    (Story) => (
      <div style={{ margin: "48px auto", maxWidth: 420, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <StoryShell initialEntries={["/auth"]} initialUser={undefined}>
      <LoginPage />
    </StoryShell>
  ),
  title: "Features/Auth/Login",
} satisfies Meta<typeof LoginPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
