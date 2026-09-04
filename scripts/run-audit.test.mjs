import { describe, expect, it } from "vitest";

import { hasAuditMetadata } from "./run-audit.mjs";

describe("audit result classification", () => {
  it("recognizes a completed vulnerability report", () => {
    expect(
      hasAuditMetadata(
        JSON.stringify({ metadata: { vulnerabilities: { high: 1 } } }),
      ),
    ).toBe(true);
  });

  it.each(["", "not json", JSON.stringify({ error: "Unavailable" })])(
    "treats an infrastructure response as incomplete",
    (output) => {
      expect(hasAuditMetadata(output)).toBe(false);
    },
  );
});
