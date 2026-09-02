import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Icon } from "./Icon";

describe("Icon", () => {
  it("renders the mapped SVG with inherited color and requested size", () => {
    const { container } = render(
      <Icon className="ant-dropdown-menu-item-icon" name="edit" size={24} />,
    );
    const icon = container.querySelector("svg");

    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toHaveClass("ant-dropdown-menu-item-icon");
    expect(icon).toHaveAttribute("fill", "currentColor");
    expect(icon).toHaveStyle({ fontSize: "24px" });
    expect(icon?.querySelector("path")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
