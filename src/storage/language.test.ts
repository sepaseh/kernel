import { describe, expect, it } from "vitest";

import { defaultLanguage } from "@/config/language";

import { getLanguage, setLanguage } from "./language";

describe("getLanguage", () => {
  it("returns the default language when not set", () => {
    expect(getLanguage()).toBe(defaultLanguage);
  });

  it("returns the stored language", () => {
    setLanguage("es");

    expect(getLanguage()).toBe("es");
  });
});

describe("setLanguage", () => {
  it("persists the language", () => {
    setLanguage("de");

    expect(getLanguage()).toBe("de");
  });
});
