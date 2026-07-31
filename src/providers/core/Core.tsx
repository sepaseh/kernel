import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import jalaliday from "jalaliday";
import { FC, ReactNode, useCallback, useEffect, useState } from "react";

import { Language, RouteKey, storageKeys, Theme } from "@/config";
import { CoreContext, CoreContextProps } from "@/contexts";
import { i18nInstance } from "@/i18n";
import { faDayjs } from "@/locales";
import {
  getLanguage,
  getTheme,
  setLanguage as setLanguageStorage,
  setTheme as setThemeStorage,
  useLocalStorageWatcher,
} from "@/storage";

dayjs.extend(calendar);
dayjs.extend(jalaliday);
dayjs.locale(faDayjs, undefined, true);
dayjs.locale("fa");

type CoreProviderProps = {
  children: ReactNode;
};

type StateProps = Pick<
  CoreContextProps,
  "currentRoute" | "language" | "theme" | "user"
>;

export const CoreProvider: FC<CoreProviderProps> = ({ children }) => {
  const [state, setState] = useState<StateProps>({
    currentRoute: "root",
    language: getLanguage(),
    theme: getTheme(),
  });
  const { currentRoute, language, theme, user } = state;

  const setUser: CoreContextProps["setUser"] = useCallback((user) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  const setCurrentRoute = useCallback((currentRoute: RouteKey) => {
    setState((prev) => ({ ...prev, currentRoute }));
  }, []);

  const setLanguage = (language: Language, fromStorage?: boolean) => {
    if (!fromStorage) setLanguageStorage(language);

    i18nInstance.changeLanguage(language);

    setState((prev) => ({ ...prev, language }));
  };

  const setTheme = (theme: Theme, fromStorage?: boolean) => {
    if (!fromStorage) setThemeStorage(theme);

    setState((prev) => ({ ...prev, theme }));
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
