import { beforeEach, describe, expect, it } from "vitest";

import { defaultLanguage, defaultTheme, storageKeys } from "@/shared/config";

import { getLanguage, setLanguage } from "./language";
import { getTheme, setTheme } from "./theme";

beforeEach(() => {
  localStorage.clear();
});

describe("stored preferences", () => {
  it("uses the default language and theme when values are missing", () => {
    expect(getLanguage()).toBe(defaultLanguage);
    expect(getTheme()).toBe(defaultTheme);
  });

  it("updates the language", () => {
    setLanguage("en");

    expect(getLanguage()).toBe("en");
    expect(localStorage.getItem(storageKeys.language)).toBe('"en"');
  });

  it("updates the theme", () => {
    setTheme("light");

    expect(getTheme()).toBe("light");
    expect(localStorage.getItem(storageKeys.theme)).toBe('"light"');
  });
});
