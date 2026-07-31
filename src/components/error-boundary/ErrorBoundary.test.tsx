import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { i18nInstance } from "@/i18n";
import { setObservabilityTransport } from "@/utils";

import { ErrorBoundary } from "./";

const BrokenView = () => {
  throw new Error("render failed");
};

afterEach(() => {
  setObservabilityTransport();
  vi.restoreAllMocks();
});

describe("ErrorBoundary", () => {
  it("renders healthy children", () => {
    render(
      <ErrorBoundary>
        <p>Ready</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("reports render failures and offers recovery", async () => {
    await i18nInstance.changeLanguage("en");
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const send = vi.fn();
    setObservabilityTransport(send);

    render(
      <ErrorBoundary>
        <BrokenView />
      </ErrorBoundary>,
    );

    expect(
      screen.getByRole("heading", {
        name: "An unexpected error occurred.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload" })).toBeInTheDocument();
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({
          source: "react.error-boundary",
        }),
        message: "render failed",
        name: "error",
      }),
    );
  });
});
