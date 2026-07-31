import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OtpInput } from "./OtpInput";

describe("OtpInput", () => {
  it("filters aria-required while forwarding supported props", () => {
    const { container } = render(
      <OtpInput aria-required length={4} size="large" />,
    );

    expect(container.querySelectorAll("input")).toHaveLength(4);
    expect(container.querySelector("[aria-required]")).not.toBeInTheDocument();
  });
});
