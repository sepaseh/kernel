import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import jalaliday from "jalaliday";
import { FC, ReactNode, useCallback, useEffect, useState } from "react";

import { RouteKey } from "@/app/config";
import { CoreContext, CoreContextValue } from "@/app/contexts";
import { Language, storageKeys, Theme } from "@/shared/config";
import { i18nInstance } from "@/shared/i18n";
import { faDayjs } from "@/shared/i18n/locales";
import {
  getLanguage,
  getTheme,
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
  const [currentRoute, setCurrentRouteState] = useState<RouteKey>("root");
  const [language, setLanguageState] = useState<Language>(getLanguage());
  const [theme, setThemeState] = useState<Theme>(getTheme());
  const [user, setUserState] = useState<CoreContextValue["user"]>();

  const setUser: CoreContextValue["setUser"] = useCallback((user) => {
    setUserState(user);
  }, []);

  const setCurrentRoute = useCallback((currentRoute: RouteKey) => {
    setCurrentRouteState(currentRoute);
  }, []);

  const setLanguage = (language: Language, fromStorage?: boolean) => {
    if (!fromStorage) setLanguageStorage(language);

    i18nInstance.changeLanguage(language);

    setLanguageState(language);
  };

  const setTheme = (theme: Theme, fromStorage?: boolean) => {
    if (!fromStorage) setThemeStorage(theme);

    setThemeState(theme);
  };

  useLocalStorageWatcher(storageKeys.language, () => {
    setLanguage(getLanguage(), true);
  });

  useLocalStorageWatcher(storageKeys.theme, () => {
    setTheme(getTheme(), true);
  });

  useEffect(() => {
    dayjs.calendar(language === "fa" ? "jalali" : "gregory");
    dayjs.locale(language === "fa" ? "fa" : "en");
  }, [language]);

  return (
    <CoreContext.Provider
      value={{
        currentRoute,
        language,
        setCurrentRoute,
        setLanguage,
        setTheme,
        setUser,
        theme,
        user,
      }}
    >
      {children}
    </CoreContext.Provider>
  );
};
