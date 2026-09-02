import type { Meta, StoryObj } from "@storybook/react-vite";

import { Icon } from "./Icon";

const meta = {
  args: { name: "user", size: 24 },
  argTypes: {
    name: {
      control: "select",
      options: [
        "add",
        "bolt",
        "check",
        "chevronLeft",
        "chevronRight",
        "close",
        "compact",
        "delete",
        "edit",
        "expand",
        "home",
        "key",
        "lightMode",
        "lock",
        "logout",
        "menu",
        "moon",
        "user",
        "upload",
      ],
    },
  },
  component: Icon,
  tags: ["autodocs"],
  title: "Shared UI/Icon",
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ alignItems: "center", display: "flex", gap: 16 }}>
      <Icon name="user" size={16} />
      <Icon name="user" size={24} />
      <Icon name="user" size={32} />
    </div>
  ),
};
