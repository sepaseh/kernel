import { createContext } from "react";

import { Language } from "@/config/language";
import { RouteKey } from "@/config/routes";
import { Theme } from "@/config/theme";

export type CoreContextProps = {
  currentRoute: RouteKey;
  language: Language;
  setCurrentRoute: (route: RouteKey) => void;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
  theme: Theme;
};

export const CoreContext = createContext<CoreContextProps | undefined>(
  undefined,
);
