import {
  ConfigProvider,
  ConfigProviderProps,
  GlobalToken,
  message as Message,
  Modal,
  notification as Notification,
  theme as antdTheme,
  ThemeConfig,
} from "antd";
import enUS from "antd/locale/en_US";
import faIR from "antd/locale/fa_IR";
import { FC, ReactNode, useEffect } from "react";

import { Language, Theme } from "@/config";
import { AntdContext } from "@/contexts";
import { useCore } from "@/hooks";

type Palette = Pick<
  GlobalToken,
  | "colorBgBase"
  | "colorBgContainer"
  | "colorBorder"
  | "colorTextBase"
  | "colorTextDescription"
  | "colorTextPlaceholder"
>;

const token: Partial<GlobalToken> = {
  colorLink: "#0a84ff",
  colorPrimary: "#d70015",
};

const palettes: Record<Theme, Palette> = {
  light: {
    colorBgBase: "#f9f9f9",
    colorBgContainer: "#ffffff",
    colorBorder: "#e5e5ea",
    colorTextBase: "#2c2c2e",
    colorTextDescription: "#48484a",
    colorTextPlaceholder: "#6b6b70",
  },
  dark: {
    colorBgBase: "#1c1c1e",
    colorBgContainer: "#1a1a1a",
    colorBorder: "#3a3a3c",
    colorTextBase: "#ffffff",
    colorTextDescription: "#aeaeb2",
    colorTextPlaceholder: "#aeaeb2",
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
  dark: buildThemeConfig(antdTheme.darkAlgorithm, palettes.dark),
  light: buildThemeConfig(antdTheme.defaultAlgorithm, palettes.light),
};

const localeConfigs = {
  en: { direction: "ltr", locale: enUS },
  fa: { direction: "rtl", locale: faIR },
} satisfies Record<Language, Pick<ConfigProviderProps, "direction" | "locale">>;

export const AntdProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const [messageAPI, messageHolder] = Message.useMessage();
  const [modalAPI, modalHolder] = Modal.useModal();
  const [notificationAPI, notificationHolder] = Notification.useNotification();

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
      <AntdContext.Provider value={{ messageAPI, modalAPI, notificationAPI }}>
        {children}
        {messageHolder}
        {modalHolder}
        {notificationHolder}
      </AntdContext.Provider>
    </ConfigProvider>
  );
};
