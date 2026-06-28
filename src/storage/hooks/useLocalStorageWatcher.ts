import { useEffect } from "react";

import { storageKeys } from "@/config";

export const useLocalStorageWatcher = (
  key: (typeof storageKeys)[keyof typeof storageKeys],
  callback: () => void,
) => {
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key) callback();
    };

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, [key, callback]);
};
