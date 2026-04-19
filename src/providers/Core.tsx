import { FC, ReactNode, useCallback, useState } from "react";

import { storageKeys } from "@/config/constants";
import { Language } from "@/config/language";
import { RouteKey } from "@/config/routes";
import { Theme } from "@/config/theme";
import { CoreContext, CoreContextProps } from "@/contexts/Core";
import i18n from "@/i18n";
import { useLocalStorageWatcher } from "@/storage/hooks/useLocalStorageWatcher";
import {
  getLanguage,
  setLanguage as setLanguageStorage,
} from "@/storage/language";
import { getTheme, setTheme as setThemeStorage } from "@/storage/theme";

type StateProps = Pick<CoreContextProps, "currentRoute" | "language" | "theme">;

export const CoreProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<StateProps>({
    currentRoute: "root",
    language: getLanguage(),
    theme: getTheme(),
  });
  const { currentRoute, language, theme } = state;

  const setCurrentRoute = useCallback((currentRoute: RouteKey) => {
    setState((prev) => ({ ...prev, currentRoute }));
  }, []);

  const setLanguage = (language: Language, fromStorage?: boolean) => {
    if (!fromStorage) setLanguageStorage(language);
    i18n.changeLanguage(language);
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

  return (
    <CoreContext.Provider
      value={{
        currentRoute,
        language,
        setCurrentRoute,
        setLanguage,
        setTheme,
        theme,
      }}
    >
      {children}
    </CoreContext.Provider>
  );
};
