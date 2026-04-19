import { describe, expect, it } from "vitest";

import { defaultTheme, themeConfigs } from "./theme";

describe("defaultTheme", () => {
  it("is light", () => {
    expect(defaultTheme).toBe("light");
  });
});

describe("themeConfigs", () => {
  it("has light and dark configs", () => {
    expect(themeConfigs).toHaveProperty("light");
    expect(themeConfigs).toHaveProperty("dark");
  });

  it("light config has a token with expected colors", () => {
    const { token } = themeConfigs.light;

    expect(token?.colorBgBase).toBe("#ffffff");
    expect(token?.colorText).toBe("#02122c");
  });

  it("dark config has a token with expected colors", () => {
    const { token } = themeConfigs.dark;

    expect(token?.colorBgBase).toBe("#02122c");
    expect(token?.colorText).toBe("#eef3fc");
  });

  it("both configs share the same primary color", () => {
    expect(themeConfigs.light.token?.colorPrimary).toBe(
      themeConfigs.dark.token?.colorPrimary,
    );
  });
});
