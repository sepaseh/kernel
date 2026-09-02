import { createContext } from "react";

import type { RouteKey } from "@/app/config";
import { type Account } from "@/features/account/types";
import type { Language, Theme, ThemePalettes } from "@/shared/config";

export type CoreContextValue = {
  compact: boolean;
  currentRoute: RouteKey;
  language: Language;
  logos?: Record<Theme, string>;
  setCompact: (compact: boolean) => void;
  setCurrentRoute: (route: RouteKey) => void;
  setLanguage: (language: Language) => void;
  setLogos: (logos: Record<Theme, string>) => void;
  setTheme: (theme: Theme) => void;
  setThemePalettes: (themePalettes: ThemePalettes) => void;
  setUser: (user?: Account) => void;
  theme: Theme;
  themePalettes?: ThemePalettes;
  user?: Account;
};

export const CoreContext = createContext<CoreContextValue | undefined>(
  undefined,
);
