import type { Meta, StoryObj } from "@storybook/react-vite";

import { StoryShell } from "@/test/storybook/StoryShell";

import { RegisterPage } from "./Register";

const meta = {
  component: RegisterPage,
  decorators: [
    (Story) => (
      <div style={{ margin: "32px auto", maxWidth: 520, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <StoryShell initialEntries={["/auth/register"]} initialUser={undefined}>
      <RegisterPage />
    </StoryShell>
  ),
  title: "Features/Auth/Register",
} satisfies Meta<typeof RegisterPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
