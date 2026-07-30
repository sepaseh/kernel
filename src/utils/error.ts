import { i18nInstance } from "@/i18n";

export const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : i18nInstance.t("unexpectedError");
