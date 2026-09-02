import process from "node:process";
import { fileURLToPath, URL } from "node:url";

import { loadEnv } from "vite";

export const validateProductionEnv = (env) => {
  const apiUrl = env.VITE_API_BASE_URL;
  const appBaseUrl = env.VITE_APP_BASE_URL;
  const observabilityUrl = env.VITE_OBSERVABILITY_URL;
  if (!apiUrl) {
    throw new Error("VITE_API_BASE_URL is required for production builds");
  }

  try {
    new URL(apiUrl);
  } catch {
    throw new Error("VITE_API_BASE_URL must be a valid absolute URL");
  }

  if (!appBaseUrl || !appBaseUrl.startsWith("/") || !appBaseUrl.endsWith("/")) {
    throw new Error(
      "VITE_APP_BASE_URL must start and end with / in production",
    );
  }

  if (observabilityUrl) {
    try {
      new URL(observabilityUrl);
    } catch {
      throw new Error("VITE_OBSERVABILITY_URL must be a valid absolute URL");
    }
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  validateProductionEnv(loadEnv("production", process.cwd(), ""));
}
