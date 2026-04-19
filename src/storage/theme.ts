import { storageKeys } from "@/config/constants";
import { defaultTheme, Theme } from "@/config/theme";

import { getState, setState } from "./state";

export const getTheme = () => {
  return getState(storageKeys.theme, defaultTheme);
};

export const setTheme = (theme: Theme) => {
  setState(storageKeys.theme, theme);
};
