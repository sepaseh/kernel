import { describe, expect, it } from "vitest";

import { defaultTheme } from "@/config/theme";

import { getTheme, setTheme } from "./theme";

describe("getTheme", () => {
  it("returns the default theme when not set", () => {
    expect(getTheme()).toBe(defaultTheme);
  });

  it("returns the stored theme", () => {
    setTheme("dark");

    expect(getTheme()).toBe("dark");
  });
});

describe("setTheme", () => {
  it("persists the theme", () => {
    setTheme("light");

    expect(getTheme()).toBe("light");
  });
});
