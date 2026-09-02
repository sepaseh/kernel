import type { FC, ReactNode } from "react";
import { useMemo, useState } from "react";
import { MemoryRouter } from "react-router";

import type { CoreContextValue } from "@/app/contexts";
import { CoreContext } from "@/app/contexts";
import { AntdProvider } from "@/app/providers";
import type { Account } from "@/features/account";
import type { Language, Theme } from "@/shared/config";

import { sampleAccount } from "./fixtures";

type StoryShellProps = {
  children: ReactNode;
  initialEntries?: string[];
  initialLanguage?: Language;
  initialTheme?: Theme;
  initialUser?: Account;
  withUser?: boolean;
};

export const StoryShell: FC<StoryShellProps> = ({
  children,
  initialEntries = ["/"],
  initialLanguage = "en",
  initialTheme = "light",
  initialUser = sampleAccount,
  withUser = true,
}) => {
  const [compact, setCompact] = useState(false);
  const [language, setLanguage] = useState(initialLanguage);
  const [logos, setLogos] = useState<CoreContextValue["logos"]>();
  const [theme, setTheme] = useState(initialTheme);
  const [themePalettes, setThemePalettes] =
    useState<CoreContextValue["themePalettes"]>();
  const [user, setUser] = useState<CoreContextValue["user"]>(
    withUser ? initialUser : undefined,
  );
  const value = useMemo<CoreContextValue>(
    () => ({
      compact,
      currentRoute: "root",
      language,
      logos,
      setCompact,
      setCurrentRoute: () => undefined,
      setLanguage,
      setLogos,
      setTheme,
      setThemePalettes,
      setUser,
      theme,
      themePalettes,
      user,
    }),
    [compact, language, logos, theme, themePalettes, user],
  );

  return (
    <CoreContext.Provider value={value}>
      <AntdProvider>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </AntdProvider>
    </CoreContext.Provider>
  );
};
