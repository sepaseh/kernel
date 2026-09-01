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
  initialUser?: Account | null;
};

export const StoryShell: FC<StoryShellProps> = ({
  children,
  initialEntries = ["/"],
  initialLanguage = "en",
  initialTheme = "light",
  initialUser = sampleAccount,
}) => {
  const [language, setLanguage] = useState(initialLanguage);
  const [theme, setTheme] = useState(initialTheme);
  const [user, setUser] = useState<CoreContextValue["user"]>(
    initialUser ?? undefined,
  );
  const value = useMemo<CoreContextValue>(
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
