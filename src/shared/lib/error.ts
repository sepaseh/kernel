import { i18nInstance } from "@/shared/i18n";

export const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : i18nInstance.t("unexpectedError");
