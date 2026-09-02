import { theme as antdTheme } from "antd";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAntd } from "@/app/hooks/useAntd";
import type { ThemePalettes } from "@/shared/config";
import { brandPrimaryColor } from "@/shared/config";
import { render, screen } from "@/test/render";

import { AntdProvider } from "./Antd";

const mocks = vi.hoisted(() => ({
  compact: false,
  language: "en" as "en" | "fa",
  theme: "light" as "dark" | "light",
  themePalettes: undefined as ThemePalettes | undefined,
}));

vi.mock("@/app/hooks", () => ({
  useCore: () => ({
    compact: mocks.compact,
    language: mocks.language,
    theme: mocks.theme,
    themePalettes: mocks.themePalettes,
  }),
}));

const Consumer = () => {
  const { messageAPI, modalAPI, notificationAPI } = useAntd();
  const { token } = antdTheme.useToken();

  return (
    <>
      <output aria-label="antd-context">
        {messageAPI && modalAPI && notificationAPI ? "ready" : "missing"}
      </output>
      <output aria-label="control-height">{token.controlHeight}</output>
      <output aria-label="primary-color">{token.colorPrimary}</output>
    </>
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
  mocks.compact = false;
  mocks.language = "en";
  mocks.theme = "light";
  mocks.themePalettes = undefined;
});

afterEach(() => {
  document.body.style.backgroundColor = "";
  document.body.style.color = "";
  document.documentElement.removeAttribute("dir");
  document.documentElement.removeAttribute("lang");
});

describe("AntdProvider", () => {
  it("applies the configured palette for the active theme", () => {
    mocks.themePalettes = {
      dark: {
        colorBgBase: "#101010",
        colorBgContainer: "#202020",
        colorBorder: "#303030",
        colorLink: "#404040",
        colorPrimary: "#505050",
        colorTextBase: "#f0f0f0",
        colorTextDescription: "#d0d0d0",
      },
      light: {
        colorBgBase: "#abcdef",
        colorBgContainer: "#ffffff",
        colorBorder: "#dddddd",
        colorLink: "#123456",
        colorPrimary: "#654321",
        colorTextBase: "#112233",
        colorTextDescription: "#445566",
      },
    };

    render(
      <AntdProvider>
        <Consumer />
      </AntdProvider>,
    );

    expect(document.body).toHaveStyle({
      backgroundColor: "#abcdef",
      color: "#112233",
    });
  });

  it("provides Ant Design APIs and applies language and theme attributes", () => {
    const { rerender } = render(
      <AntdProvider>
        <Consumer />
      </AntdProvider>,
    );

    expect(screen.getByLabelText("antd-context")).toHaveTextContent("ready");
    expect(screen.getByLabelText("primary-color")).toHaveTextContent(
      brandPrimaryColor,
    );
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

  it("applies Ant Design compact sizing globally", () => {
    const { rerender } = render(
      <AntdProvider>
        <Consumer />
      </AntdProvider>,
    );
    const defaultControlHeight = Number(
      screen.getByLabelText("control-height").textContent,
    );

    mocks.compact = true;
    rerender(
      <AntdProvider>
        <Consumer />
      </AntdProvider>,
    );

    expect(
      Number(screen.getByLabelText("control-height").textContent),
    ).toBeLessThan(defaultControlHeight);
  });
});
