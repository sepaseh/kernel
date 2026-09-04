import { describe, expect, it } from "vitest";

import { hasAuditMetadata, isCompletedAuditResult } from "./run-audit.mjs";

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

  it("rejects a zero exit status without audit metadata", () => {
    expect(isCompletedAuditResult({ status: 0, stdout: "" })).toBe(false);
  });

  it("accepts completed reports for both clean and blocking audits", () => {
    const stdout = JSON.stringify({
      metadata: { vulnerabilities: { high: 1 } },
    });

    expect(isCompletedAuditResult({ status: 0, stdout })).toBe(true);
    expect(isCompletedAuditResult({ status: 1, stdout })).toBe(true);
  });

  it("rejects terminated audit processes", () => {
    const stdout = JSON.stringify({ metadata: { vulnerabilities: {} } });

    expect(isCompletedAuditResult({ status: null, stdout })).toBe(false);
  });
});
