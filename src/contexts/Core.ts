import { createContext } from "react";

import { Language, RouteKey, Theme } from "@/config";
import { UserProps } from "@/types";

export type CoreContextProps = {
  currentRoute: RouteKey;
  language: Language;
  setCurrentRoute: (route: RouteKey) => void;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
  setUser: (user?: UserProps) => void;
  theme: Theme;
  user?: UserProps;
};

export const CoreContext = createContext<CoreContextProps | undefined>(
  undefined,
);
