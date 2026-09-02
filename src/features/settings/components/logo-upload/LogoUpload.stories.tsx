import type { Meta, StoryObj } from "@storybook/react-vite";

import { LogoUpload } from "./LogoUpload";

const meta = {
  component: LogoUpload,
  parameters: { layout: "centered" },
  title: "Features/Settings/LogoUpload",
} satisfies Meta<typeof LogoUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const CurrentLogo: Story = {
  args: { url: "/logo.svg", value: "logo-1" },
};
