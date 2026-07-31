import { ReactNode, useMemo, useState } from "react";
import { MemoryRouter } from "react-router";

import { CoreContext, CoreContextProps } from "@/app/contexts";
import { AntdProvider } from "@/app/providers";
import { AccountProps } from "@/features/account";
import { Language, Theme } from "@/shared/config";

import { sampleAccount } from "./fixtures";

type StoryShellProps = {
  children: ReactNode;
  initialEntries?: string[];
  initialLanguage?: Language;
  initialTheme?: Theme;
  initialUser?: AccountProps;
};

export const StoryShell = ({
  children,
  initialEntries = ["/"],
  initialLanguage = "en",
  initialTheme = "light",
  initialUser = sampleAccount,
}: StoryShellProps) => {
  const [language, setLanguage] = useState(initialLanguage);
  const [theme, setTheme] = useState(initialTheme);
  const [user, setUser] = useState<CoreContextProps["user"]>(initialUser);
  const value = useMemo<CoreContextProps>(
    () => ({
      currentRoute: "root",
      language,
      setCurrentRoute: () => undefined,
      setLanguage,
      setTheme,
      setUser,
      theme,
      user,
    }),
    [language, theme, user],
  );

  return (
    <CoreContext.Provider value={value}>
      <AntdProvider>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </AntdProvider>
    </CoreContext.Provider>
  );
};
