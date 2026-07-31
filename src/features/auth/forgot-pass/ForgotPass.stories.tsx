import type { Meta, StoryObj } from "@storybook/react-vite";

import { StoryShell } from "@/test/storybook/StoryShell";

import { ForgotPassPage } from "./ForgotPass";

const meta = {
  component: ForgotPassPage,
  decorators: [
    (Story) => (
      <div style={{ margin: "32px auto", maxWidth: 480, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <StoryShell
      initialEntries={["/auth/forgot-password"]}
      initialUser={undefined}
    >
      <ForgotPassPage />
    </StoryShell>
  ),
  title: "Features/Auth/ForgotPassword",
} satisfies Meta<typeof ForgotPassPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
