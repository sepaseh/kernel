import { storageKeys } from "@/config/constants";
import { defaultLanguage, Language } from "@/config/language";

import { getState, setState } from "./state";

export const getLanguage = () => {
  return getState(storageKeys.language, defaultLanguage);
};

export const setLanguage = (language: Language) => {
  setState(storageKeys.language, language);
};
