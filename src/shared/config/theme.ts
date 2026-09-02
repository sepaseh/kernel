export type Theme = "dark" | "light";

export const themeColorFields = [
  "colorBgBase",
  "colorBgContainer",
  "colorBorder",
  "colorLink",
  "colorPrimary",
  "colorTextBase",
  "colorTextDescription",
] as const;

type ThemeColorField = (typeof themeColorFields)[number];

export type ThemeColors = Record<ThemeColorField, string>;

export type ThemePalettes = Record<Theme, ThemeColors>;

export const brandPrimaryColor = "#61dafb";

export const defaultLogos: Record<Theme, string> = {
  dark: "/logo.svg",
  light: "/logo.svg",
};

export const defaultTheme: Theme = "dark";
