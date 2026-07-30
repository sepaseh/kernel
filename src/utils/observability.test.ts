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
