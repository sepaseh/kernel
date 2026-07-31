import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { storageKeys } from "@/shared/config";

import { useLocalStorageWatcher } from "./useLocalStorageWatcher";

describe("useLocalStorageWatcher", () => {
  it("calls the callback when the watched key changes", () => {
    const callback = vi.fn();
    renderHook(() => useLocalStorageWatcher(storageKeys.language, callback));

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: storageKeys.language }),
      );
    });

    expect(callback).toHaveBeenCalledOnce();
  });

  it("ignores changes to other storage keys", () => {
    const callback = vi.fn();
    renderHook(() => useLocalStorageWatcher(storageKeys.theme, callback));

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: storageKeys.language }),
      );
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("stops watching storage events after unmount", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() =>
      useLocalStorageWatcher(storageKeys.theme, callback),
    );

    unmount();
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: storageKeys.theme }),
      );
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
