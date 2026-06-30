export const modalKeys = {
  create: "#create",
  data: "#data",
  docs: "#docs",
  roles: "#roles",
  update: "#update",
  video: "#video",
} as const;

export const storageKeys = {
  language: "language",
  theme: "theme",
} as const;

export const defaultPageSize = 24 as const;

export const apiUrl: string =
  import.meta.env.VITE_API_BASE_URL ?? `http://${location.hostname}`;
export const authTokenKey: string =
  import.meta.env.VITE_AUTH_TOKEN_KEY ?? "kernel_auth_token";
export const baseUrl: string = import.meta.env.VITE_APP_BASE_URL ?? "";
