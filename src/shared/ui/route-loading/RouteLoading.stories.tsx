import type { Meta, StoryObj } from "@storybook/react-vite";

import { RouteLoading } from "./RouteLoading";

const meta = {
  component: RouteLoading,
  parameters: { layout: "fullscreen" },
  title: "Shared UI/RouteLoading",
} satisfies Meta<typeof RouteLoading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
