import type { Meta, StoryObj } from "@storybook/react-vite";

import { DigitsInput } from "./DigitsInput";

const meta = {
  args: {
    "aria-label": "Numeric value",
    placeholder: "Digits only",
  },
  component: DigitsInput,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  title: "Shared UI/DigitsInput",
} satisfies Meta<typeof DigitsInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithValue: Story = {
  args: { defaultValue: "123456" },
};

export const Disabled: Story = {
  args: { defaultValue: "123456", disabled: true },
};
