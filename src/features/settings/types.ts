import type { Language, ThemePalettes } from "@/shared/config";

type Logo = { id: string; url: string };

export type ApplicationLanguage = {
  calendar: "gregorian" | "jalali";
  code: Language;
  direction: "ltr" | "rtl";
  name: string;
  nativeName: string;
};

export type ApplicationSettings = {
  darkLogo?: Logo;
  darkTheme: ThemePalettes["dark"];
  language: ApplicationLanguage;
  lightLogo?: Logo;
  lightTheme: ThemePalettes["light"];
};

export type ApplicationSettingsRequest = Pick<
  ApplicationSettings,
  "darkTheme" | "lightTheme"
> & {
  darkLogoId?: Logo["id"];
  languageCode: ApplicationLanguage["code"];
  lightLogoId?: Logo["id"];
};
