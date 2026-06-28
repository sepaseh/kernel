import { defaultTheme, storageKeys, Theme } from "@/config";

import { getState, setState } from "./state";

export const getTheme = () => {
  return getState(storageKeys.theme, defaultTheme);
};

export const setTheme = (theme: Theme) => {
  setState(storageKeys.theme, theme);
};
