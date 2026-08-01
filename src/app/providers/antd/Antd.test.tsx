import { theme as antdTheme } from "antd";
import { useContext } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AntdContext } from "@/app/contexts";
import { render, screen } from "@/test/render";

import { AntdProvider } from "./Antd";

const mocks = vi.hoisted(() => ({
  language: "en" as "en" | "fa",
  theme: "light" as "dark" | "light",
}));

vi.mock("@/app/hooks", () => ({
  useCore: () => ({
    language: mocks.language,
    theme: mocks.theme,
  }),
}));

const Consumer = () => {
  const value = useContext(AntdContext);

  return (
    <output aria-label="antd-context">
      {value?.messageAPI && value.modalAPI && value.notificationAPI
        ? "ready"
        : "missing"}
    </output>
  );
};

const normalizedColors = (theme: "dark" | "light") => {
  const tokens = antdTheme.getDesignToken({
    algorithm:
      theme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
  });
  const element = document.createElement("div");
  element.style.backgroundColor = tokens.colorBgBase;
  element.style.color = tokens.colorTextBase;

  return {
    backgroundColor: element.style.backgroundColor,
    color: element.style.color,
  };
};

beforeEach(() => {
  mocks.language = "en";
  mocks.theme = "light";
});

afterEach(() => {
  document.body.style.backgroundColor = "";
  document.body.style.color = "";
  document.documentElement.removeAttribute("dir");
  document.documentElement.removeAttribute("lang");
});

describe("AntdProvider", () => {
  it("provides Ant Design APIs and applies language and theme attributes", () => {
    const { rerender } = render(
      <AntdProvider>
        <Consumer />
      </AntdProvider>,
    );

    expect(screen.getByLabelText("antd-context")).toHaveTextContent("ready");
    expect(document.documentElement).toHaveAttribute("dir", "ltr");
    expect(document.documentElement).toHaveAttribute("lang", "en");
    expect(document.body.style.backgroundColor).toBe(
      normalizedColors("light").backgroundColor,
    );
    expect(document.body.style.color).toBe(normalizedColors("light").color);

    mocks.language = "fa";
    mocks.theme = "dark";
    rerender(
      <AntdProvider>
        <Consumer />
      </AntdProvider>,
    );

    expect(document.documentElement).toHaveAttribute("dir", "rtl");
    expect(document.documentElement).toHaveAttribute("lang", "fa");
    expect(document.body.style.backgroundColor).toBe(
      normalizedColors("dark").backgroundColor,
    );
    expect(document.body.style.color).toBe(normalizedColors("dark").color);
  });
});
