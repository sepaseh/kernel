import { describe, expect, it } from "vitest";

import { defaultLanguage, languageNames, languages } from "./language";

describe("languages", () => {
  it("includes the default language", () => {
    expect(languages).toContain(defaultLanguage);
  });

  it("has a display name for every language", () => {
    languages.forEach((lang) => {
      expect(languageNames).toHaveProperty(lang);
      expect(languageNames[lang].length).toBeGreaterThan(0);
    });
  });
});
