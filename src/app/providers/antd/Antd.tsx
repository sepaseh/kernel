import type { ConfigProviderProps, GlobalToken, ThemeConfig } from "antd";
import { App as AntdApp, ConfigProvider, theme as antdTheme } from "antd";
import ar from "antd/locale/ar_EG";
import de from "antd/locale/de_DE";
import en from "antd/locale/en_GB";
import es from "antd/locale/es_ES";
import fa from "antd/locale/fa_IR";
import fr from "antd/locale/fr_FR";
import it from "antd/locale/it_IT";
import pt from "antd/locale/pt_PT";
import ru from "antd/locale/ru_RU";
import tr from "antd/locale/tr_TR";
import type { FC, ReactNode } from "react";
import { useEffect } from "react";

import { useCore } from "@/app/hooks";
import type { Language, Theme, ThemeColors } from "@/shared/config";
import { brandPrimaryColor } from "@/shared/config";

type AntdProviderProps = {
  children?: ReactNode;
};

type Palette = ThemeColors & Pick<GlobalToken, "colorTextPlaceholder">;

const algorithms = {
  dark: antdTheme.darkAlgorithm,
  light: antdTheme.defaultAlgorithm,
} satisfies Record<Theme, ThemeConfig["algorithm"]>;

const darkTokens = antdTheme.getDesignToken({ algorithm: algorithms.dark });
const lightTokens = antdTheme.getDesignToken({ algorithm: algorithms.light });

// This palette is starter scaffolding. Remove it in a real project and use the
// product's own brand colors; these defaults keep the starter aligned with Ant Design.
const palettes: Record<Theme, Palette> = {
  light: {
    colorBgBase: lightTokens.colorBgBase,
    colorBgContainer: lightTokens.colorBgContainer,
    colorBorder: lightTokens.colorBorder,
    colorLink: lightTokens.colorLink,
    colorPrimary: brandPrimaryColor,
    colorTextBase: lightTokens.colorTextBase,
    colorTextDescription: lightTokens.colorTextDescription,
    colorTextPlaceholder: lightTokens.colorTextPlaceholder,
  },
  dark: {
    colorBgBase: darkTokens.colorBgBase,
    colorBgContainer: darkTokens.colorBgContainer,
    colorBorder: darkTokens.colorBorder,
    colorLink: darkTokens.colorLink,
    colorPrimary: brandPrimaryColor,
    colorTextBase: darkTokens.colorTextBase,
    colorTextDescription: darkTokens.colorTextDescription,
    colorTextPlaceholder: darkTokens.colorTextPlaceholder,
  },
};

const buildThemeConfig = (
  algorithm: ThemeConfig["algorithm"],
  p: Palette,
): ThemeConfig => {
  const designToken = antdTheme.getDesignToken({ algorithm });

  return {
    algorithm,
    token: {
      ...p,
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
      FloatButton: {
        colorPrimary: designToken.colorSuccess,
        colorPrimaryActive: designToken.colorSuccessActive,
        colorPrimaryHover: designToken.colorSuccessHover,
      },
      Menu: {
        colorBgContainer: "transparent",
        colorSplit: "transparent",
        itemPaddingInline: 8,
      },
    },
  };
};

const localeConfigs = {
  ar: { direction: "rtl", locale: ar },
  de: { direction: "ltr", locale: de },
  en: { direction: "ltr", locale: en },
  es: { direction: "ltr", locale: es },
  fa: { direction: "rtl", locale: fa },
  fr: { direction: "ltr", locale: fr },
  it: { direction: "ltr", locale: it },
  pt: { direction: "ltr", locale: pt },
  ru: { direction: "ltr", locale: ru },
  tr: { direction: "ltr", locale: tr },
} satisfies Record<Language, Pick<ConfigProviderProps, "direction" | "locale">>;

export const AntdProvider: FC<AntdProviderProps> = ({ children }) => {
  const { compact, language, theme: currentTheme, themePalettes } = useCore();
  const palette = {
    ...palettes[currentTheme],
    ...themePalettes?.[currentTheme],
  };
  const algorithm = compact
    ? [algorithms[currentTheme], antdTheme.compactAlgorithm]
    : algorithms[currentTheme];
  const themeConfig = buildThemeConfig(algorithm, palette);
  const { token } = themeConfig;
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
    <ConfigProvider direction={direction} locale={locale} theme={themeConfig}>
      <AntdApp component={false}>{children}</AntdApp>
    </ConfigProvider>
  );
};
