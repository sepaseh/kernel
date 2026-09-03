import type { Meta, StoryObj } from "@storybook/react-vite";

import { PersonIcon } from "./PersonIcon";

const meta = {
  component: PersonIcon,
  tags: ["autodocs"],
  title: "Shared UI/Icons/PersonIcon",
} satisfies Meta<typeof PersonIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { style: { fontSize: 24 } },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ alignItems: "center", display: "flex", gap: 16 }}>
      <PersonIcon style={{ fontSize: 16 }} />
      <PersonIcon style={{ fontSize: 24 }} />
      <PersonIcon style={{ fontSize: 32 }} />
    </div>
  ),
};
