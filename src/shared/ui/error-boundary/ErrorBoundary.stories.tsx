import type { Meta, StoryObj } from "@storybook/react-vite";

import { ErrorBoundary } from "./ErrorBoundary";

const BrokenContent = () => {
  throw new Error("Intentional Storybook error");
};

const meta = {
  component: ErrorBoundary,
  parameters: { layout: "fullscreen" },
  title: "Shared UI/ErrorBoundary",
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Content: Story = {
  args: { children: <p>Application content</p> },
};
export const Fallback: Story = { args: { children: <BrokenContent /> } };
