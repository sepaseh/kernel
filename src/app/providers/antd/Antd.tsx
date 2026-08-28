import {
  App as AntdApp,
  ConfigProvider,
  ConfigProviderProps,
  GlobalToken,
  theme as antdTheme,
  ThemeConfig,
} from "antd";
import enUS from "antd/locale/en_US";
import faIR from "antd/locale/fa_IR";
import { FC, ReactNode, useEffect } from "react";

import { useCore } from "@/app/hooks";
import { Language, Theme } from "@/shared/config";

type AntdProviderProps = {
  children?: ReactNode;
};

type Palette = Pick<
  GlobalToken,
  | "colorBgBase"
  | "colorBgContainer"
  | "colorBorder"
  | "colorTextBase"
  | "colorTextDescription"
  | "colorTextPlaceholder"
>;

const algorithms = {
  dark: antdTheme.darkAlgorithm,
  light: antdTheme.defaultAlgorithm,
} satisfies Record<Theme, ThemeConfig["algorithm"]>;

const darkTokens = antdTheme.getDesignToken({ algorithm: algorithms.dark });
const lightTokens = antdTheme.getDesignToken({ algorithm: algorithms.light });

const token: Partial<GlobalToken> = {
  colorLink: lightTokens.colorLink,
  colorPrimary: lightTokens.colorPrimary,
};

// This palette is starter scaffolding. Remove it in a real project and use the
// product's own brand colors; these defaults keep the starter aligned with Ant Design.
const palettes: Record<Theme, Palette> = {
  light: {
    colorBgBase: lightTokens.colorBgBase,
    colorBgContainer: lightTokens.colorBgContainer,
    colorBorder: lightTokens.colorBorder,
    colorTextBase: lightTokens.colorTextBase,
    colorTextDescription: lightTokens.colorTextDescription,
    colorTextPlaceholder: lightTokens.colorTextPlaceholder,
  },
  dark: {
    colorBgBase: darkTokens.colorBgBase,
    colorBgContainer: darkTokens.colorBgContainer,
    colorBorder: darkTokens.colorBorder,
    colorTextBase: darkTokens.colorTextBase,
    colorTextDescription: darkTokens.colorTextDescription,
    colorTextPlaceholder: darkTokens.colorTextPlaceholder,
  },
};

const buildThemeConfig = (
  algorithm: ThemeConfig["algorithm"],
  p: Palette,
): ThemeConfig => ({
  algorithm,
  token: {
    ...p,
    ...token,
    fontFamily: "inherit",
    colorBgElevated: p.colorBgContainer,
    screenXLMax: 1399,
    screenXXL: 1400,
    screenXXLMin: 1400,
  },
  components: {
    Badge: {
      dotSize: 12,
    },
    Divider: {
      marginLG: 0,
    },
    Menu: {
      colorBgContainer: "transparent",
      colorSplit: "transparent",
      itemPaddingInline: 8,
    },
  },
});

const themeConfigs: Record<Theme, ThemeConfig> = {
  dark: buildThemeConfig(algorithms.dark, palettes.dark),
  light: buildThemeConfig(algorithms.light, palettes.light),
};

const localeConfigs = {
  en: { direction: "ltr", locale: enUS },
  fa: { direction: "rtl", locale: faIR },
} satisfies Record<Language, Pick<ConfigProviderProps, "direction" | "locale">>;

export const AntdProvider: FC<AntdProviderProps> = ({ children }) => {
  const { language, theme: currentTheme } = useCore();
  const { token } = themeConfigs[currentTheme];
  const { direction, locale } = localeConfigs[language];

  useEffect(() => {
    document.body.style.backgroundColor = token?.colorBgBase ?? "";
    document.body.style.color = token?.colorTextBase ?? "";
  }, [token]);

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [direction, language]);

  return (
    <ConfigProvider
      direction={direction}
      locale={locale}
      theme={themeConfigs[currentTheme]}
    >
      <AntdApp component={false}>{children}</AntdApp>
    </ConfigProvider>
  );
};
