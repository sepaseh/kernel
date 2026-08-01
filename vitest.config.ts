import { defineConfig } from "vitest/config";

import { srcPath } from "./tooling/paths.ts";

export default defineConfig({
  resolve: {
    alias: {
      "@": srcPath,
    },
  },
  test: {
    clearMocks: true,
    coverage: {
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.test.{ts,tsx}",
        "src/**/index.ts",
        "src/main.tsx",
        "src/test/**",
        "src/features/**/types.ts",
        "src/shared/api/types.ts",
      ],
      include: ["src/**/*.{ts,tsx}"],
      provider: "v8",
      reporter: ["text", "json-summary", "html", "lcov"],
      thresholds: {
        branches: 54,
        functions: 59,
        lines: 69,
        statements: 68,
      },
    },
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://localhost/",
      },
    },
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.mjs"],
    restoreMocks: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
