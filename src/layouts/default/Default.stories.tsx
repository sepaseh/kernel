import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { mocked } from "storybook/test";

import { CoreContext, CoreContextProps } from "@/app/contexts";
import { AntdProvider } from "@/app/providers";
import { AccountProps, getAccount } from "@/features/account";
import { Theme } from "@/shared/config";

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

const DefaultLayoutStory = () => {
  const [theme, setTheme] = useState<Theme>("light");
  const [user, setUser] = useState<CoreContextProps["user"]>(account);
  const value = useMemo<CoreContextProps>(
    () => ({
      currentRoute: "root",
      language: "en",
      setCurrentRoute: () => undefined,
      setLanguage: () => undefined,
      setTheme,
      setUser,
      theme,
      user,
    }),
    [theme, user],
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
