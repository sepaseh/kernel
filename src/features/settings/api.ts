import { apiClient } from "@/shared/api";
import { defaultLanguage, normalizeLanguage } from "@/shared/config";

import type {
  ApplicationLanguage,
  ApplicationSettings,
  ApplicationSettingsRequest,
} from "./types";

const basePath = "/settings";
const languagesPath = "/languages";

const normalizeApplicationLanguage = (
  language: ApplicationLanguage,
): ApplicationLanguage => ({
  ...language,
  code: normalizeLanguage(language.code) ?? defaultLanguage,
});

const normalizeApplicationSettings = (
  settings: ApplicationSettings,
): ApplicationSettings => ({
  ...settings,
  language: normalizeApplicationLanguage(settings.language),
});

export const fetchApplicationSettings = (): Promise<ApplicationSettings> =>
  apiClient
    .get<ApplicationSettings>(basePath)
    .then(normalizeApplicationSettings);

export const fetchLanguages = (): Promise<ApplicationLanguage[]> =>
  apiClient
    .get<ApplicationLanguage[]>(languagesPath)
    .then((languages) => languages.map(normalizeApplicationLanguage));

export const updateApplicationSettings = (
  params: ApplicationSettingsRequest,
): Promise<ApplicationSettings> =>
  apiClient
    .put<ApplicationSettings>(basePath, params)
    .then(normalizeApplicationSettings);
