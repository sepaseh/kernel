import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { MemoryRouter, Route, Routes } from "react-router";

import { CoreContext, CoreContextProps } from "@/app/contexts";
import { AntdProvider } from "@/app/providers";

import { AuthLayout } from "./Auth";

const AuthLayoutStory = () => {
  const [user, setUser] = useState<CoreContextProps["user"]>();

  return (
    <CoreContext.Provider
      value={{
        currentRoute: "auth",
        language: "en",
        setCurrentRoute: () => undefined,
        setLanguage: () => undefined,
        setTheme: () => undefined,
        setUser,
        theme: "light",
        user,
      }}
    >
      <AntdProvider>
        <MemoryRouter initialEntries={["/auth"]}>
          <Routes>
            <Route element={<AuthLayout />} path="/auth">
              <Route
                index
                element={
                  <div style={{ display: "grid", gap: 16 }}>
                    <strong>Sign in</strong>
                    <span>
                      Authentication content renders inside the layout.
                    </span>
                  </div>
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
  component: AuthLayout,
  render: () => <AuthLayoutStory />,
  title: "Layouts/Auth",
} satisfies Meta<typeof AuthLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
