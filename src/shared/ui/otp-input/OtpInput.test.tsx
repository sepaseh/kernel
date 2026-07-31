import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OtpInput } from "./";

describe("OtpInput", () => {
  it("does not forward aria-required to the OTP group", () => {
    const { container } = render(
      <OtpInput aria-required length={4} size="large" />,
    );

    expect(container.querySelectorAll("input")).toHaveLength(4);
    expect(container.querySelector("[aria-required]")).not.toBeInTheDocument();
  });
});
