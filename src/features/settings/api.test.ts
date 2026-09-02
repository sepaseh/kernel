import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/shared/api";

import {
  fetchApplicationSettings,
  fetchLanguages,
  updateApplicationSettings,
} from "./api";
import type { ApplicationSettings } from "./types";

vi.mock("@/shared/api", () => ({
  apiClient: { get: vi.fn(), put: vi.fn() },
}));

const settings: ApplicationSettings = {
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
  vi.mocked(apiClient.get).mockResolvedValue(settings);
  vi.mocked(apiClient.put).mockResolvedValue(settings);
});

describe("settings API", () => {
  it("loads settings and supported languages", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce(settings)
      .mockResolvedValueOnce([settings.language]);

    await fetchApplicationSettings();
    await fetchLanguages();

    expect(apiClient.get).toHaveBeenNthCalledWith(1, "/settings");
    expect(apiClient.get).toHaveBeenNthCalledWith(2, "/languages");
  });

  it("normalizes regional language codes", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      ...settings,
      language: { ...settings.language, code: "fa-IR" },
    });

    await expect(fetchApplicationSettings()).resolves.toMatchObject({
      language: { code: "fa" },
    });
  });

  it("updates the complete settings payload", async () => {
    const request = {
      darkTheme: settings.darkTheme,
      languageCode: settings.language.code,
      lightTheme: settings.lightTheme,
    };

    await updateApplicationSettings(request);

    expect(apiClient.put).toHaveBeenCalledWith("/settings", request);
  });
});
