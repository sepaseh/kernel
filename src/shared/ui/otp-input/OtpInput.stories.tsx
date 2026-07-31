import type { Meta, StoryObj } from "@storybook/react-vite";

import { OtpInput } from "./OtpInput";

const meta = {
  args: { length: 6 },
  component: OtpInput,
  parameters: { layout: "centered" },
  title: "Shared UI/OtpInput",
} satisfies Meta<typeof OtpInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const WithValue: Story = { args: { value: "123456" } };
export const Disabled: Story = { args: { disabled: true, value: "123456" } };
export const FourDigits: Story = { args: { length: 4, value: "1234" } };
