import "dayjs/locale/ar";
import "dayjs/locale/de";
import "dayjs/locale/en-gb";
import "dayjs/locale/es";
import "dayjs/locale/fr";
import "dayjs/locale/it";
import "dayjs/locale/pt";
import "dayjs/locale/ru";
import "dayjs/locale/tr";

import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import jalaliday from "jalaliday";
import type { FC, ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import type { RouteKey } from "@/app/config";
import type { CoreContextValue } from "@/app/contexts";
import { CoreContext } from "@/app/contexts";
import { fetchApplicationSettings } from "@/features/settings/api";
import type { Language, Theme } from "@/shared/config";
import { defaultLogos, storageKeys } from "@/shared/config";
import { i18nInstance } from "@/shared/i18n";
import { faDayjs } from "@/shared/i18n/locales";
import {
  getCompact,
  getLanguage,
  getTheme,
  setCompact as setCompactStorage,
  setLanguage as setLanguageStorage,
  setTheme as setThemeStorage,
  useLocalStorageWatcher,
} from "@/shared/storage";

dayjs.extend(calendar);
dayjs.extend(jalaliday);
dayjs.locale(faDayjs, undefined, true);
dayjs.locale("fa");

type CoreProviderProps = {
  children: ReactNode;
};

export const CoreProvider: FC<CoreProviderProps> = ({ children }) => {
  const [compact, setCompact] = useState(getCompact());
  const [currentRoute, setCurrentRoute] = useState<RouteKey>("root");
  const [language, setLanguage] = useState<Language>(getLanguage());
  const [logos, setLogos] = useState<CoreContextValue["logos"]>(defaultLogos);
  const [theme, setTheme] = useState<Theme>(getTheme());
  const [themePalettes, setThemePalettes] =
    useState<CoreContextValue["themePalettes"]>();
  const [user, setUser] = useState<CoreContextValue["user"]>();

  const changeLanguage = useCallback(
    (language: Language, fromStorage?: boolean) => {
      if (!fromStorage) setLanguageStorage(language);
      void i18nInstance.changeLanguage(language);
      setLanguage(language);
    },
    [],
  );

  const changeTheme = (theme: Theme, fromStorage?: boolean) => {
    if (!fromStorage) setThemeStorage(theme);
    setTheme(theme);
  };

  const changeCompact = (compact: boolean, fromStorage?: boolean) => {
    if (!fromStorage) setCompactStorage(compact);
    setCompact(compact);
  };

  useLocalStorageWatcher(storageKeys.compact, () => {
    changeCompact(getCompact(), true);
  });

  useLocalStorageWatcher(storageKeys.language, () => {
    changeLanguage(getLanguage(), true);
  });

  useLocalStorageWatcher(storageKeys.theme, () => {
    changeTheme(getTheme(), true);
  });

  useEffect(() => {
    let active = true;

    void fetchApplicationSettings()
      .then(({ darkLogo, darkTheme, language, lightLogo, lightTheme }) => {
        if (!active) return;

        changeLanguage(language.code);
        setLogos({
          dark: darkLogo?.url ?? defaultLogos.dark,
          light: lightLogo?.url ?? defaultLogos.light,
        });
        setThemePalettes({ dark: darkTheme, light: lightTheme });
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [changeLanguage]);

  useEffect(() => {
    dayjs.calendar(language === "fa" ? "jalali" : "gregory");
    dayjs.locale(language === "en" ? "en-gb" : language);
  }, [language]);

  return (
    <CoreContext.Provider
      value={{
        compact,
        currentRoute,
        language,
        logos,
        setCompact: changeCompact,
        setCurrentRoute,
        setLanguage: changeLanguage,
        setLogos,
        setTheme: changeTheme,
        setThemePalettes,
        setUser,
        theme,
        themePalettes,
        user,
      }}
    >
      {children}
    </CoreContext.Provider>
  );
};
