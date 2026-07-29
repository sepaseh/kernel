export const modalKeys = {
  create: "#create",
  password: "#password",
  roles: "#roles",
  workspaces: "#workspaces",
  update: "#update",
} as const;

export const storageKeys = {
  language: "language",
  theme: "theme",
} as const;

export const defaultPageSize = 12 as const;

export const apiUrl: string =
  import.meta.env.VITE_API_BASE_URL ?? `http://${location.hostname}`;
export const baseUrl: string = import.meta.env.VITE_APP_BASE_URL ?? "";
