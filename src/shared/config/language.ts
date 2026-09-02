const languages = [
  "ar",
  "de",
  "en",
  "es",
  "fa",
  "fr",
  "it",
  "pt",
  "ru",
  "tr",
] as const;

export type Language = (typeof languages)[number];

export const defaultLanguage: Language = "fa";

const isLanguage = (value: string): value is Language =>
  languages.includes(value as Language);

export const normalizeLanguage = (value: string): Language | undefined => {
  const language = value.split(/[-_]/, 1)[0]?.toLowerCase();

  return language && isLanguage(language) ? language : undefined;
};
