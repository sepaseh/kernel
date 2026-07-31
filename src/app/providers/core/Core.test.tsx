import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCore } from "@/app/hooks";
import { storageKeys } from "@/shared/config";
import { render, screen } from "@/test/render";

import { CoreProvider } from "./";

const mocks = vi.hoisted(() => ({
  changeLanguage: vi.fn(),
  getLanguage: vi.fn<() => "en" | "fa">(),
  getTheme: vi.fn<() => "dark" | "light">(),
  setLanguage: vi.fn(),
  setTheme: vi.fn(),
  watchers: new Map<string, () => void>(),
}));

vi.mock("@/app/i18n", () => ({
  i18nInstance: {
    changeLanguage: mocks.changeLanguage,
  },
}));

vi.mock("@/shared/storage", () => ({
  getLanguage: mocks.getLanguage,
  getTheme: mocks.getTheme,
  setLanguage: mocks.setLanguage,
  setTheme: mocks.setTheme,
  useLocalStorageWatcher: (key: string, callback: () => void) => {
    mocks.watchers.set(key, callback);
  },
}));

const Consumer = () => {
  const core = useCore();

  return (
    <>
      <output aria-label="core-state">
        {`${core.currentRoute}:${core.language}:${core.theme}:${core.user?.id ?? "anonymous"}`}
      </output>
      <button onClick={() => core.setCurrentRoute("users")} type="button">
        route
      </button>
      <button onClick={() => core.setLanguage("fa")} type="button">
        language
      </button>
      <button onClick={() => core.setTheme("dark")} type="button">
        theme
      </button>
      <button
        onClick={() =>
          core.setUser({
            email: "ada@example.com",
            firstName: "Ada",
            id: "user-1",
            isSystemAdmin: false,
            lastName: "Lovelace",
            mobile: "09120000000",
            permissions: [],
            personnelCode: "1001",
            status: "active",
            username: "ada",
          })
        }
        type="button"
      >
        user
      </button>
    </>
  );
};

beforeEach(() => {
  mocks.getLanguage.mockReturnValue("en");
  mocks.getTheme.mockReturnValue("light");
});

afterEach(() => {
  mocks.watchers.clear();
});

describe("CoreProvider", () => {
  it("updates application state and persists user preferences", async () => {
    const { user } = render(
      <CoreProvider>
        <Consumer />
      </CoreProvider>,
    );

    expect(screen.getByLabelText("core-state")).toHaveTextContent(
      "root:en:light:anonymous",
    );

    await user.click(screen.getByRole("button", { name: "route" }));
    await user.click(screen.getByRole("button", { name: "language" }));
    await user.click(screen.getByRole("button", { name: "theme" }));
    await user.click(screen.getByRole("button", { name: "user" }));

    expect(screen.getByLabelText("core-state")).toHaveTextContent(
      "users:fa:dark:user-1",
    );
    expect(mocks.setLanguage).toHaveBeenCalledWith("fa");
    expect(mocks.changeLanguage).toHaveBeenCalledWith("fa");
    expect(mocks.setTheme).toHaveBeenCalledWith("dark");
  });

  it("applies preference changes received from storage without writing back", () => {
    render(
      <CoreProvider>
        <Consumer />
      </CoreProvider>,
    );
    mocks.getLanguage.mockReturnValue("fa");
    mocks.getTheme.mockReturnValue("dark");

    act(() => {
      mocks.watchers.get(storageKeys.language)?.();
      mocks.watchers.get(storageKeys.theme)?.();
    });

    expect(screen.getByLabelText("core-state")).toHaveTextContent(
      "root:fa:dark:anonymous",
    );
    expect(mocks.setLanguage).not.toHaveBeenCalled();
    expect(mocks.setTheme).not.toHaveBeenCalled();
    expect(mocks.changeLanguage).toHaveBeenCalledWith("fa");
  });
});
