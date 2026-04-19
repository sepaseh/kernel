import { theme as antdTheme, ThemeConfig } from "antd";
import { GlobalToken } from "antd/es/theme/interface";

export type Theme = "dark" | "light";

export const defaultTheme: Theme = "light";

type Palette = Pick<
  GlobalToken,
  | "colorBgBase"
  | "colorBgElevated"
  | "colorBgLayout"
  | "colorBorder"
  | "colorBorderSecondary"
  | "colorText"
  | "colorTextTertiary"
>;

const palettes: Record<Theme, Palette> = {
  light: {
    colorBgBase: "#ffffff",
    colorBgElevated: "#fcfcfd",
    colorBgLayout: "#f6f6f9",
    colorBorder: "#f2f2f2",
    colorBorderSecondary: "#e6e6e6",
    colorText: "#02122c",
    colorTextTertiary: "#718198",
  },
  dark: {
    colorBgBase: "#02122c",
    colorBgElevated: "#061c3c",
    colorBgLayout: "#11284b",
    colorBorder: "#11284b",
    colorBorderSecondary: "#1b4074",
    colorText: "#eef3fc",
    colorTextTertiary: "#8496ae",
  },
};

const buildThemeConfig = (
  p: Palette,
  algorithm: ThemeConfig["algorithm"],
): ThemeConfig => ({
  algorithm,
  token: {
    ...p,
    borderRadius: 12,
    borderRadiusLG: 12,
    borderRadiusSM: 8,
    borderRadiusXS: 4,
    colorPrimary: "#2053df",
    colorWarning: "#ffc35c",
    fontFamily: "inherit",
    fontWeightStrong: 500,
    colorBgContainer: p.colorBgBase,
    colorBgContainerDisabled: p.colorBgLayout,
    colorBgSpotlight: "#0438c8",
    colorLink: p.colorText,
    colorLinkHover: p.colorText,
    colorSplit: p.colorBorderSecondary,
    colorTextDescription: p.colorText,
  },
  components: {
    Form: { labelColor: p.colorTextTertiary },
    Input: {
      activeBorderColor: p.colorBorderSecondary,
      activeShadow: "none",
      colorBgContainer: p.colorBgElevated,
      colorTextPlaceholder: p.colorTextTertiary,
      hoverBorderColor: p.colorBorderSecondary,
      inputFontSize: 16,
      paddingBlock: 16,
    },
    Modal: {
      borderRadiusLG: 24,
      borderRadiusSM: 24,
      controlHeight: 36,
      marginSM: 0,
      marginXS: 0,
      titleFontSize: 22,
      titleLineHeight: "24px",
    },
    Select: {
      activeBorderColor: p.colorBorderSecondary,
      activeOutlineColor: "transparent",
      colorBgContainer: p.colorBgElevated,
      colorTextPlaceholder: p.colorTextTertiary,
      controlHeight: 56,
      hoverBorderColor: p.colorBorderSecondary,
      optionHeight: 36,
      optionLineHeight: "28px",
      optionPadding: "4px 12px",
    },
    Table: {
      borderColor: p.colorBorder,
      headerBg: p.colorBgLayout,
    },
    Upload: {
      colorFillAlter: p.colorBgElevated,
      colorPrimary: p.colorBorderSecondary,
      colorPrimaryHover: p.colorBorderSecondary,
    },
  },
});

export const themeConfigs: Record<Theme, ThemeConfig> = {
  light: buildThemeConfig(palettes.light, antdTheme.defaultAlgorithm),
  dark: buildThemeConfig(palettes.dark, antdTheme.darkAlgorithm),
};
