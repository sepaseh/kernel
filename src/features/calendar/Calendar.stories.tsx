import type { Meta, StoryObj } from "@storybook/react-vite";
import { mocked } from "storybook/test";

import { StoryShell } from "@/test/storybook/StoryShell";

import { fetchCalendarDates } from "./api";
import { CalendarPage } from "./Calendar";

const meta = {
  async beforeEach() {
    mocked(fetchCalendarDates).mockResolvedValue(["2026-09-15", "2026-09-23"]);
  },
  component: CalendarPage,
  render: () => (
    <StoryShell initialEntries={["/calendar"]}>
      <CalendarPage />
    </StoryShell>
  ),
  title: "Features/Calendar/Page",
} satisfies Meta<typeof CalendarPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
