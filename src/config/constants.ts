export const storageKeys = {
  language: "language",
  onboarding: "hasFinishedOnboarding",
  theme: "theme",
  token: "token",
} as const;

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];

export const apiUrl: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
