import process from "node:process";
import { URL } from "node:url";

import { loadEnv } from "vite";

const env = loadEnv("production", process.cwd(), "");
const apiUrl = env.VITE_API_BASE_URL;
const appBaseUrl = env.VITE_APP_BASE_URL;
const observabilityUrl = env.VITE_OBSERVABILITY_URL;

if (!apiUrl) {
  throw new Error("VITE_API_BASE_URL is required for production builds");
}

let parsedApiUrl;

try {
  parsedApiUrl = new URL(apiUrl);
} catch {
  throw new Error("VITE_API_BASE_URL must be a valid absolute URL");
}

if (parsedApiUrl.protocol !== "https:") {
  throw new Error("VITE_API_BASE_URL must use HTTPS in production");
}

if (!appBaseUrl || !appBaseUrl.startsWith("/") || !appBaseUrl.endsWith("/")) {
  throw new Error("VITE_APP_BASE_URL must start and end with / in production");
}

if (observabilityUrl) {
  let parsedObservabilityUrl;

  try {
    parsedObservabilityUrl = new URL(observabilityUrl);
  } catch {
    throw new Error("VITE_OBSERVABILITY_URL must be a valid absolute URL");
  }

  if (parsedObservabilityUrl.protocol !== "https:") {
    throw new Error("VITE_OBSERVABILITY_URL must use HTTPS in production");
  }
}
