import { waitFor } from "@testing-library/react";
import type * as ReactI18next from "react-i18next";
import { beforeEach, expect, it, vi } from "vitest";

import { render, screen } from "@/test/render";

import {
  fetchApplicationSettings,
  fetchLanguages,
  updateApplicationSettings,
} from "./api";
import { SettingsPage } from "./Settings";
import type { ApplicationSettings } from "./types";

const mocks = vi.hoisted(() => ({
  messageError: vi.fn(),
  messageSuccess: vi.fn(),
  modalConfirm: vi.fn(),
  setLanguage: vi.fn(),
  setLogos: vi.fn(),
  setThemePalettes: vi.fn(),
}));

vi.mock("./api", () => ({
  fetchApplicationSettings: vi.fn(),
  fetchLanguages: vi.fn(),
  updateApplicationSettings: vi.fn(),
}));

vi.mock("@/app/hooks", () => ({
  useAntd: () => ({
    messageAPI: { error: mocks.messageError, success: mocks.messageSuccess },
    modalAPI: { confirm: mocks.modalConfirm },
  }),
  useCore: () => ({
    setLanguage: mocks.setLanguage,
    setLogos: mocks.setLogos,
    setThemePalettes: mocks.setThemePalettes,
    user: {},
  }),
}));

vi.mock("@/app/lib", () => ({
  getRoutePermissions: () => ({ canUpdate: true }),
}));

vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<typeof ReactI18next>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

const settings: ApplicationSettings = {
  darkLogo: { id: "dark-logo", url: "/dark.svg" },
  darkTheme: {
    colorBgBase: "#141414",
    colorBgContainer: "#1f1f1f",
    colorBorder: "#424242",
    colorLink: "#1668dc",
    colorPrimary: "#1677ff",
    colorTextBase: "#ffffff",
    colorTextDescription: "#bfbfbf",
  },
  language: {
    calendar: "jalali",
    code: "fa",
    direction: "rtl",
    name: "Persian",
    nativeName: "فارسی",
  },
  lightLogo: { id: "light-logo", url: "/light.svg" },
  lightTheme: {
    colorBgBase: "#ffffff",
    colorBgContainer: "#ffffff",
    colorBorder: "#d9d9d9",
    colorLink: "#1677ff",
    colorPrimary: "#1677ff",
    colorTextBase: "#000000",
    colorTextDescription: "#8c8c8c",
  },
};

beforeEach(() => {
  vi.mocked(fetchApplicationSettings).mockResolvedValue(settings);
  vi.mocked(fetchLanguages).mockResolvedValue([settings.language]);
  vi.mocked(updateApplicationSettings).mockResolvedValue(settings);
});

it("loads, confirms, persists, and applies system settings", async () => {
  const { user } = render(<SettingsPage />);

  await screen.findByText("فارسی");
  await user.click(screen.getByRole("button", { name: "submit" }));

  const confirmation = mocks.modalConfirm.mock.calls.at(-1)?.[0] as {
    onOk: () => Promise<void>;
  };
  await confirmation.onOk();

  await waitFor(() => expect(updateApplicationSettings).toHaveBeenCalled());
  expect(mocks.setLanguage).toHaveBeenCalledWith("fa");
  expect(mocks.setLogos).toHaveBeenCalledWith({
    dark: "/dark.svg",
    light: "/light.svg",
  });
  expect(mocks.setThemePalettes).toHaveBeenCalledWith({
    dark: settings.darkTheme,
    light: settings.lightTheme,
  });
  expect(mocks.messageSuccess).toHaveBeenCalledWith("settingsUpdated");
});
