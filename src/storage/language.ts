import { defaultLanguage, Language, storageKeys } from "@/config";

import { getState, setState } from "./state";

export const getLanguage = () => {
  return getState(storageKeys.language, defaultLanguage);
};

export const setLanguage = (language: Language) => {
  setState(storageKeys.language, language);
};
