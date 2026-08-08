import { describe, expect, it } from "vitest";

import { loginInputStyles } from "./styles";

describe("login input styles", () => {
  it("uses LTR entry text with an RTL placeholder", () => {
    expect(loginInputStyles).toMatchObject({
      "&::placeholder": { direction: "rtl", textAlign: "right" },
      direction: "ltr",
      textAlign: "left",
    });
  });
});
