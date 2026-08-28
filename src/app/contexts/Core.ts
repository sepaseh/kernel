import { createContext } from "react";

import { RouteKey } from "@/app/config";
import { type Account } from "@/features/account/types";
import { Language, Theme } from "@/shared/config";

export type CoreContextValue = {
  currentRoute: RouteKey;
  language: Language;
  setCurrentRoute: (route: RouteKey) => void;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
  setUser: (user?: Account) => void;
  theme: Theme;
  user?: Account;
};

export const CoreContext = createContext<CoreContextValue | undefined>(
  undefined,
);
