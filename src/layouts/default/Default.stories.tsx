import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { mocked } from "storybook/test";

import { CoreContext, CoreContextProps } from "@/app/contexts";
import { AntdProvider } from "@/app/providers";
import { AccountProps, getAccount } from "@/features/account";
import { Language, Theme } from "@/shared/config";

import { DefaultLayout } from "./Default";

const account: AccountProps = {
  email: "admin@example.com",
  firstName: "Sample",
  id: "storybook-user",
  isSystemAdmin: true,
  lastName: "Admin",
  mobile: "09120000000",
  permissions: [],
  personnelCode: "1001",
  status: "active",
  username: "admin",
};

const DefaultLayoutStory = ({
  initialLanguage = "en",
  initialTheme = "light",
  initialUser = account,
}: {
  initialLanguage?: Language;
  initialTheme?: Theme;
  initialUser?: AccountProps | null;
}) => {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [user, setUser] = useState<CoreContextProps["user"]>(
    initialUser ?? undefined,
  );
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
  render: () => <DefaultLayoutStory initialUser={null} />,
};

export const DarkRtl: Story = {
  globals: { direction: "rtl", theme: "dark" },
  render: () => <DefaultLayoutStory initialLanguage="fa" initialTheme="dark" />,
};
