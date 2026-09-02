import { act, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCore } from "@/app/hooks";
import { storageKeys } from "@/shared/config";
import { render, screen } from "@/test/render";

import { CoreProvider } from "./Core";

const mocks = vi.hoisted(() => ({
  changeLanguage: vi.fn(),
  fetchApplicationSettings: vi.fn(),
  getCompact: vi.fn<() => boolean>(),
  getLanguage: vi.fn<() => "en" | "fa">(),
  getTheme: vi.fn<() => "dark" | "light">(),
  setCompact: vi.fn(),
  setLanguage: vi.fn(),
  setTheme: vi.fn(),
  watchers: new Map<string, () => void>(),
}));

vi.mock("@/features/settings/api", () => ({
  fetchApplicationSettings: mocks.fetchApplicationSettings,
}));

vi.mock("@/shared/i18n", () => ({
  i18nInstance: {
    changeLanguage: mocks.changeLanguage,
  },
}));

vi.mock("@/shared/storage", () => ({
  getCompact: mocks.getCompact,
  getLanguage: mocks.getLanguage,
  getTheme: mocks.getTheme,
  setCompact: mocks.setCompact,
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
        {`${core.currentRoute}:${core.language}:${core.theme}:${core.compact}:${core.user?.id ?? "anonymous"}`}
      </output>
      <output aria-label="application-settings">
        {`${core.logos?.light ?? "no-logo"}:${core.themePalettes?.light.colorPrimary ?? "no-palette"}`}
      </output>
      <button onClick={() => core.setCurrentRoute("users")} type="button">
        route
      </button>
      <button onClick={() => core.setCompact(true)} type="button">
        compact
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
  mocks.fetchApplicationSettings.mockRejectedValue(new Error("Unavailable"));
  mocks.getCompact.mockReturnValue(false);
  mocks.getLanguage.mockReturnValue("en");
  mocks.getTheme.mockReturnValue("light");
});

afterEach(() => {
  mocks.watchers.clear();
});

describe("CoreProvider", () => {
  it("applies global language, logos, and theme palettes", async () => {
    mocks.fetchApplicationSettings.mockResolvedValueOnce({
      darkLogo: { id: "dark-logo", url: "/dark.svg" },
      darkTheme: {
        colorBgBase: "#141414",
        colorBgContainer: "#1f1f1f",
        colorBorder: "#424242",
        colorLink: "#1668dc",
        colorPrimary: "#001122",
        colorTextBase: "#ffffff",
        colorTextDescription: "#bfbfbf",
      },
      language: {
        calendar: "jalali",
        code: "fa",
        direction: "rtl",
        name: "Persian",
        nativeName: "فارسی",
      },
      lightLogo: { id: "light-logo", url: "/light.svg" },
      lightTheme: {
        colorBgBase: "#ffffff",
        colorBgContainer: "#ffffff",
        colorBorder: "#d9d9d9",
        colorLink: "#1677ff",
        colorPrimary: "#112233",
        colorTextBase: "#000000",
        colorTextDescription: "#8c8c8c",
      },
    });

    render(
      <CoreProvider>
        <Consumer />
      </CoreProvider>,
    );

    await waitFor(() =>
      expect(screen.getByLabelText("application-settings")).toHaveTextContent(
        "/light.svg:#112233",
      ),
    );
    expect(screen.getByLabelText("core-state")).toHaveTextContent(
      "root:fa:light:false:anonymous",
    );
  });

  it("updates application state and persists user preferences", async () => {
    const { user } = render(
      <CoreProvider>
        <Consumer />
      </CoreProvider>,
    );

    expect(screen.getByLabelText("core-state")).toHaveTextContent(
      "root:en:light:false:anonymous",
    );
    expect(screen.getByLabelText("application-settings")).toHaveTextContent(
      "/logo.svg:no-palette",
    );

    await user.click(screen.getByRole("button", { name: "route" }));
    await user.click(screen.getByRole("button", { name: "compact" }));
    await user.click(screen.getByRole("button", { name: "language" }));
    await user.click(screen.getByRole("button", { name: "theme" }));
    await user.click(screen.getByRole("button", { name: "user" }));

    expect(screen.getByLabelText("core-state")).toHaveTextContent(
      "users:fa:dark:true:user-1",
    );
    expect(mocks.setCompact).toHaveBeenCalledWith(true);
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
    mocks.getCompact.mockReturnValue(true);
    mocks.getTheme.mockReturnValue("dark");

    act(() => {
      mocks.watchers.get(storageKeys.compact)?.();
      mocks.watchers.get(storageKeys.language)?.();
      mocks.watchers.get(storageKeys.theme)?.();
    });

    expect(screen.getByLabelText("core-state")).toHaveTextContent(
      "root:fa:dark:true:anonymous",
    );
    expect(mocks.setCompact).not.toHaveBeenCalled();
    expect(mocks.setLanguage).not.toHaveBeenCalled();
    expect(mocks.setTheme).not.toHaveBeenCalled();
    expect(mocks.changeLanguage).toHaveBeenCalledWith("fa");
  });
});
