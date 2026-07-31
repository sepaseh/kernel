import type { Meta, StoryObj } from "@storybook/react-vite";

import { StoryShell } from "@/test/storybook/StoryShell";

import { NotFoundPage } from "./NotFound";

const meta = {
  component: NotFoundPage,
  render: () => (
    <StoryShell initialEntries={["/missing"]}>
      <NotFoundPage />
    </StoryShell>
  ),
  title: "App/NotFound",
} satisfies Meta<typeof NotFoundPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
