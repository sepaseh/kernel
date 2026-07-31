import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { clearAccessToken } from "@/shared/api";
import { render, screen } from "@/test/render";

import { AuthLayout } from "./Auth";

const mocks = vi.hoisted(() => ({
  setUser: vi.fn(),
}));

vi.mock("@/shared/api", () => ({
  clearAccessToken: vi.fn(),
}));

vi.mock("@/hooks", () => ({
  useCore: () => ({ setUser: mocks.setUser }),
}));

vi.mock("antd-style", () => ({
  useAntdToken: () => ({
    colorBgBase: "#ffffff",
    colorBgLayout: "#f5f5f5",
    paddingSM: 8,
    screenXS: 480,
  }),
}));

describe("AuthLayout", () => {
  it("clears the existing session and renders the auth route", () => {
    render(
      <MemoryRouter initialEntries={["/auth"]}>
        <Routes>
          <Route element={<AuthLayout />} path="/auth">
            <Route index element={<h1>Sign in</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeVisible();
    expect(clearAccessToken).toHaveBeenCalledOnce();
    expect(mocks.setUser).toHaveBeenCalledWith();
  });
});
