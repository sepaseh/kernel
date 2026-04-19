export const languages = ["en", "es", "pt", "it", "de", "hr"] as const;

export type Language = (typeof languages)[number];

export const defaultLanguage: Language = "en";

export const languageNames: Record<Language, string> = {
  en: "English",
  de: "Deutsch",
  es: "Español",
  it: "Italiano",
  hr: "Hrvatski",
  pt: "Portuguese",
};
