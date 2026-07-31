import { createContext } from "react";

import { Language, RouteKey, Theme } from "@/config";
import { AccountProps } from "@/features/account/types";

export type CoreContextProps = {
  currentRoute: RouteKey;
  language: Language;
  setCurrentRoute: (route: RouteKey) => void;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
  setUser: (user?: AccountProps) => void;
  theme: Theme;
  user?: AccountProps;
};

export const CoreContext = createContext<CoreContextProps | undefined>(
  undefined,
);
