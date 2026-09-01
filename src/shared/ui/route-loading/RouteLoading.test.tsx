import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { i18nInstance } from "@/shared/i18n";

import { RouteLoading } from "./RouteLoading";

describe("RouteLoading", () => {
  beforeEach(async () => {
    await i18nInstance.changeLanguage("en");
  });

  it("announces that a route is loading", () => {
    render(<RouteLoading />);

    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });
});
