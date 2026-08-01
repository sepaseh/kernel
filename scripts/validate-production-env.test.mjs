import { describe, expect, it } from "vitest";

import { validateProductionEnv } from "./validate-production-env.mjs";

const valid = {
  VITE_API_BASE_URL: "https://api.example.com",
  VITE_APP_BASE_URL: "/app/",
};

describe("production environment validation", () => {
  it("accepts valid required and optional URLs", () => {
    expect(() =>
      validateProductionEnv({
        ...valid,
        VITE_OBSERVABILITY_URL: "https://events.example.com/collect",
      }),
    ).not.toThrow();
  });

  it.each([
    [{ VITE_APP_BASE_URL: "/" }, "VITE_API_BASE_URL is required"],
    [{ ...valid, VITE_API_BASE_URL: "invalid" }, "valid absolute URL"],
    [
      { ...valid, VITE_API_BASE_URL: "http://api.example.com" },
      "must use HTTPS",
    ],
    [{ ...valid, VITE_APP_BASE_URL: "app/" }, "must start and end with /"],
    [
      { ...valid, VITE_OBSERVABILITY_URL: "invalid" },
      "OBSERVABILITY_URL must be a valid",
    ],
    [
      { ...valid, VITE_OBSERVABILITY_URL: "http://events.example.com" },
      "OBSERVABILITY_URL must use HTTPS",
    ],
  ])("rejects invalid configuration", (env, message) => {
    expect(() => validateProductionEnv(env)).toThrow(message);
  });
});
