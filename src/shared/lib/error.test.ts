import { describe, expect, it, vi } from "vitest";

import { getErrorMessage } from "./error";

vi.mock("@/shared/i18n", () => ({
  i18nInstance: { t: (key: string) => key },
}));

describe("getErrorMessage", () => {
  it("returns the message from Error instances", () => {
    expect(getErrorMessage(new Error("Request failed"))).toBe("Request failed");
  });

  it("returns the localized fallback for other thrown values", () => {
    expect(getErrorMessage({ message: "unsafe value" })).toBe(
      "unexpectedError",
    );
  });
});
