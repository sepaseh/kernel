import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import jalaliday from "jalaliday";
import { FC, ReactNode, useEffect, useState } from "react";

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
  const [currentRoute, setCurrentRoute] = useState<RouteKey>("root");
  const [language, setLanguage] = useState<Language>(getLanguage());
  const [theme, setTheme] = useState<Theme>(getTheme());
  const [user, setUser] = useState<CoreContextValue["user"]>();

  const changeLanguage = (language: Language, fromStorage?: boolean) => {
    if (!fromStorage) setLanguageStorage(language);

    i18nInstance.changeLanguage(language);

    setLanguage(language);
  };

  const changeTheme = (theme: Theme, fromStorage?: boolean) => {
    if (!fromStorage) setThemeStorage(theme);

    setTheme(theme);
  };

  useLocalStorageWatcher(storageKeys.language, () => {
    changeLanguage(getLanguage(), true);
  });

  useLocalStorageWatcher(storageKeys.theme, () => {
    changeTheme(getTheme(), true);
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
        setLanguage: changeLanguage,
        setTheme: changeTheme,
        setUser,
        theme,
        user,
      }}
    >
      {children}
    </CoreContext.Provider>
  );
};
