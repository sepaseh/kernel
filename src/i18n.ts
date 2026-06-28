import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { defaultLanguage } from "@/config";
import { resources } from "@/locales";
import { getLanguage } from "@/storage";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      translation: typeof resources.fa;
    };
  }
}

const i18nInstance = i18n.use(initReactI18next);

i18nInstance.init({
  debug: false,
  defaultNS: "translation",
  fallbackLng: defaultLanguage,
  interpolation: { escapeValue: false },
  lng: getLanguage(),
  parseMissingKeyHandler: (key) => {
    console.warn(`Missing translation key: ${key}`);
    return key;
  },
  resources: Object.fromEntries(
    Object.entries(resources).map(([lang, translation]) => [
      lang,
      { translation },
    ]),
  ),
  returnEmptyString: false,
  returnNull: false,
});

export { i18nInstance };
