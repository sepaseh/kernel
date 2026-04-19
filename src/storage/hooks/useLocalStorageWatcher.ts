import { useEffect } from "react";

import { StorageKey } from "@/config/constants";

export const useLocalStorageWatcher = (
  key: StorageKey,
  callback: () => void
) => {
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key) callback();
    };

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, [key, callback]);
};
