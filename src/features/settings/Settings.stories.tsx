import type { Meta, StoryObj } from "@storybook/react-vite";
import { mocked } from "storybook/test";

import { StoryShell } from "@/test/storybook/StoryShell";

import { fetchApplicationSettings, fetchLanguages } from "./api";
import { SettingsPage } from "./Settings";

const settings = {
  darkTheme: {
    colorBgBase: "#141414",
    colorBgContainer: "#1f1f1f",
    colorBorder: "#424242",
    colorLink: "#1668dc",
    colorPrimary: "#61dafb",
    colorTextBase: "#ffffff",
    colorTextDescription: "#bfbfbf",
  },
  language: {
    calendar: "jalali" as const,
    code: "fa" as const,
    direction: "rtl" as const,
    name: "Persian",
    nativeName: "فارسی",
  },
  lightTheme: {
    colorBgBase: "#ffffff",
    colorBgContainer: "#ffffff",
    colorBorder: "#d9d9d9",
    colorLink: "#1677ff",
    colorPrimary: "#61dafb",
    colorTextBase: "#000000",
    colorTextDescription: "#8c8c8c",
  },
};

const meta = {
  async beforeEach() {
    mocked(fetchApplicationSettings).mockResolvedValue(settings);
    mocked(fetchLanguages).mockResolvedValue([settings.language]);
  },
  component: SettingsPage,
  parameters: { routePermissions: { canUpdate: true } },
  render: () => (
    <StoryShell initialEntries={["/settings"]}>
      <SettingsPage />
    </StoryShell>
  ),
  title: "Features/Settings/SettingsPage",
} satisfies Meta<typeof SettingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
