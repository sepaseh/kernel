import type { Meta, StoryObj } from "@storybook/react-vite";
import { type FC, useMemo, useState } from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { mocked } from "storybook/test";

import type { CoreContextValue } from "@/app/contexts";
import { CoreContext } from "@/app/contexts";
import { AntdProvider } from "@/app/providers";
import type { Account } from "@/features/account";
import { getAccount } from "@/features/account";
import type { Language, Theme } from "@/shared/config";

import { DefaultLayout } from "./Default";

const account: Account = {
  email: "admin@example.com",
  firstName: "Sample",
  id: "storybook-user",
  isSystemAdmin: true,
  lastName: "Admin",
  mobile: "09120000000",
  permissions: [],
  status: "active",
  username: "admin",
};

type DefaultLayoutStoryProps = {
  initialLanguage?: Language;
  initialTheme?: Theme;
  initialUser?: Account;
  withUser?: boolean;
};

const DefaultLayoutStory: FC<DefaultLayoutStoryProps> = ({
  initialLanguage = "en",
  initialTheme = "light",
  initialUser = account,
  withUser = true,
}) => {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [user, setUser] = useState<CoreContextValue["user"]>(
    withUser ? initialUser : undefined,
  );
  const value = useMemo<CoreContextValue>(
    () => ({
      compact: false,
      currentRoute: "root",
      language,
      setCurrentRoute: () => undefined,
      setCompact: () => undefined,
      setLanguage,
      setLogos: () => undefined,
      setTheme,
      setThemePalettes: () => undefined,
      setUser,
      theme,
      user,
    }),
    [language, theme, user],
  );

  return (
    <CoreContext.Provider value={value}>
      <AntdProvider>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route element={<DefaultLayout />} path="/">
              <Route
                index
                element={
                  <section style={{ padding: 24, width: "100%" }}>
                    Dashboard content renders inside the layout.
                  </section>
                }
              />
            </Route>
          </Routes>
        </MemoryRouter>
      </AntdProvider>
    </CoreContext.Provider>
  );
};

const meta = {
  async beforeEach() {
    mocked(getAccount).mockResolvedValue(account);
  },
  component: DefaultLayout,
  render: () => <DefaultLayoutStory />,
  title: "Layouts/Default",
} satisfies Meta<typeof DefaultLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Desktop: Story = {};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};

export const LoadingAccount: Story = {
  beforeEach() {
    mocked(getAccount).mockReturnValue(new Promise(() => undefined));
  },
  render: () => <DefaultLayoutStory withUser={false} />,
};

export const DarkRtl: Story = {
  globals: { direction: "rtl", theme: "dark" },
  render: () => <DefaultLayoutStory initialLanguage="fa" initialTheme="dark" />,
};
