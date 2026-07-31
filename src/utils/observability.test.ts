import { afterEach, describe, expect, it, vi } from "vitest";

import {
  reportError,
  sanitizeObservabilityValue,
  setObservabilityTransport,
} from "./observability";

afterEach(() => {
  setObservabilityTransport();
});

describe("observability", () => {
  it("redacts valid email addresses without changing malformed addresses", () => {
    expect(
      sanitizeObservabilityValue(
        "Contact ada@example.com or grace+alerts@research.example.co.uk",
      ),
    ).toBe("Contact [redacted] or [redacted]");
    expect(
      sanitizeObservabilityValue(
        "Malformed: ada@example, ada@.example.com, and @example.com",
      ),
    ).toBe("Malformed: ada@example, ada@.example.com, and @example.com");
  });

  it("handles long non-matching text without excessive backtracking", () => {
    const value = "a".repeat(200_000);

    expect(sanitizeObservabilityValue(value)).toBe(value.slice(0, 2_000));
  });

  it("handles adversarial dot-heavy email text without backtracking", () => {
    const value = `a@${"label.".repeat(20_000)}!`;

    expect(sanitizeObservabilityValue(value)).toBe(value.slice(0, 2_000));
  });

  it("redacts sensitive values recursively", () => {
    expect(
      sanitizeObservabilityValue({
        email: "ada@example.com",
        nested: {
          password: "correct horse battery staple",
          url: "https://example.com/path?token=secret&view=private",
        },
      }),
    ).toEqual({
      email: "[redacted]",
      nested: {
        password: "[redacted]",
        url: "https://example.com/path?[redacted]&[redacted]",
      },
    });
  });

  it("reports sanitized structured errors with a release", () => {
    const send = vi.fn();
    setObservabilityTransport(send);

    reportError(
      new Error(
        "Failed for ada@example.com with token=secret at " +
          "https://example.com/path?access=secret",
      ),
      { authorization: "Bearer secret", source: "test" },
    );

    expect(send).toHaveBeenCalledOnce();
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        context: {
          authorization: "[redacted]",
          source: "test",
        },
        message: expect.not.stringContaining("ada@example.com"),
        name: "error",
        release: expect.any(String),
        timestamp: expect.any(String),
      }),
    );
    expect(JSON.stringify(send.mock.calls[0])).not.toContain("secret");
  });
});
