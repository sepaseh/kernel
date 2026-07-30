import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("application routes", () => {
  it("renders the not-found page for an unknown route", async () => {
    window.history.replaceState({}, "", "/unknown-route");
    const { Routes } = await import("./Routes");

    render(<Routes />);

    expect(screen.getByText("404")).toBeInTheDocument();
  });
});
