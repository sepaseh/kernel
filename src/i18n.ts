import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { defaultLanguage } from "@/config/language";
import { resources } from "@/locales";
import { getLanguage } from "@/storage/language";

i18n.use(initReactI18next).init({
  resources: Object.fromEntries(
    Object.entries(resources).map(([lang, translations]) => [
      lang,
      { translation: translations },
    ]),
  ),
  lng: getLanguage(),
  fallbackLng: defaultLanguage,
  interpolation: { escapeValue: false },
});

export default i18n;
