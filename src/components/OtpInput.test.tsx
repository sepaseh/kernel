import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OtpInput } from "./OtpInput";

describe("OtpInput", () => {
  it("forwards aria-required with supported props", () => {
    const { container } = render(
      <OtpInput aria-required length={4} size="large" />,
    );

    expect(container.querySelectorAll("input")).toHaveLength(4);
    expect(container.querySelector("[aria-required]")).toHaveAttribute(
      "aria-required",
      "true",
    );
  });
});
