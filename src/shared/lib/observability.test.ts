import { afterEach, describe, expect, it, vi } from "vitest";

import {
  initializeObservability,
  reportError,
  sanitizeObservabilityValue,
  setObservabilityTransport,
} from "./observability";

const originalPerformanceObserver = globalThis.PerformanceObserver;

afterEach(() => {
  globalThis.PerformanceObserver = originalPerformanceObserver;
  setObservabilityTransport();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
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

  it("redacts empty, repeated, and encoded query values", () => {
    expect(
      sanitizeObservabilityValue(
        "http://example.com/path?empty=&next=value&redirect=http%3A%2F%2Fprivate.example",
      ),
    ).toBe("http://example.com/path?[redacted]&[redacted]&[redacted]");
  });

  it("handles long query-like text without excessive backtracking", () => {
    const value = `http://example.com/?${"key".repeat(70_000)}`;

    expect(sanitizeObservabilityValue(value)).toBe(value.slice(0, 2_000));
  });

  it("redacts sensitive values recursively", () => {
    expect(
      sanitizeObservabilityValue({
        email: "ada@example.com",
        nested: {
          password: "correct horse battery staple",
          url: "http://example.com/path?token=secret&view=private",
        },
      }),
    ).toEqual({
      email: "[redacted]",
      nested: {
        password: "[redacted]",
        url: "http://example.com/path?[redacted]&[redacted]",
      },
    });
  });

  it("reports sanitized structured errors with a release", () => {
    const send = vi.fn();
    setObservabilityTransport(send);

    reportError(
      new Error(
        "Failed for ada@example.com with token=secret at " +
          "http://example.com/path?access=secret",
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

  it("reports browser errors and supported performance metrics", () => {
    const callbacks: PerformanceObserverCallback[] = [];
    const observe = vi.fn();

    class PerformanceObserverMock {
      static supportedEntryTypes = [
        "largest-contentful-paint",
        "layout-shift",
        "longtask",
      ];

      constructor(callback: PerformanceObserverCallback) {
        callbacks.push(callback);
      }

      disconnect() {}

      observe = observe;

      takeRecords() {
        return [];
      }
    }

    globalThis.PerformanceObserver =
      PerformanceObserverMock as unknown as typeof PerformanceObserver;

    const send = vi.fn();
    setObservabilityTransport(send);
    initializeObservability();
    initializeObservability();

    window.dispatchEvent(
      new ErrorEvent("error", {
        colno: 4,
        error: new Error("render failed"),
        filename: "app.tsx",
        lineno: 12,
        message: "render failed",
      }),
    );
    const rejection = new Event("unhandledrejection");
    Object.defineProperty(rejection, "reason", {
      value: new Error("request failed"),
    });
    window.dispatchEvent(rejection);

    const notify = (
      callback: PerformanceObserverCallback,
      entries: Partial<PerformanceEntry>[],
    ) => {
      callback(
        {
          getEntries: () => entries as PerformanceEntryList,
          getEntriesByName: () => [],
          getEntriesByType: () => [],
        },
        {} as PerformanceObserver,
      );
    };

    notify(callbacks[0], [{ startTime: 123.456 }]);
    notify(callbacks[1], [
      { hadRecentInput: false, value: 0.123 },
      { hadRecentInput: true, value: 10 },
    ] as unknown as Partial<PerformanceEntry>[]);
    notify(callbacks[2], [{ duration: 51.234 }]);

    expect(observe).toHaveBeenCalledTimes(3);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        metric: "largest-contentful-paint",
        value: 123.46,
      }),
    );
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        metric: "cumulative-layout-shift",
        value: 0.12,
      }),
    );
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ metric: "long-task", value: 51.23 }),
    );
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({ source: "window.error" }),
        name: "error",
      }),
    );
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        context: { source: "unhandledrejection" },
        name: "error",
      }),
    );
  });

  it("sends events to the configured endpoint without surfacing failures", async () => {
    vi.resetModules();
    vi.stubEnv(
      "VITE_OBSERVABILITY_URL",
      "http://observability.example.com/events",
    );
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("offline"));
    const { reportError: reportWithDefaultTransport } =
      await import("./observability");

    reportWithDefaultTransport("failed for ada@example.com");

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledWith(
      "http://observability.example.com/events",
      expect.objectContaining({
        body: expect.not.stringContaining("ada@example.com"),
        method: "POST",
      }),
    );
  });
});
