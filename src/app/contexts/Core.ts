import { createContext } from "react";

import { RouteKey } from "@/app/config";
import { AccountProps } from "@/features/account/types";
import { Language, Theme } from "@/shared/config";

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
