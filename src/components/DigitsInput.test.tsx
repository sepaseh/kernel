import { useState } from "react";
import { describe, expect, it } from "vitest";

import { render, screen } from "@/test/render";

import { DigitsInput } from "./DigitsInput";

const DigitsInputHarness = () => {
  const [value, setValue] = useState("");

  return (
    <DigitsInput
      aria-label="Mobile"
      onChange={(event) => setValue(event.target.value)}
      value={value}
    />
  );
};

describe("DigitsInput", () => {
  it("keeps only numeric characters while typing", async () => {
    const { user } = render(<DigitsInputHarness />);

    await user.type(screen.getByRole("textbox", { name: "Mobile" }), "a1 b2");

    expect(screen.getByRole("textbox", { name: "Mobile" })).toHaveValue("12");
  });
});
