import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
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
        "src/types/**",
      ],
      include: ["src/**/*.{ts,tsx}"],
      provider: "v8",
      reporter: ["text", "json-summary", "html", "lcov"],
      thresholds: {
        branches: 5,
        functions: 5,
        lines: 5,
        statements: 5,
      },
    },
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://localhost/",
      },
    },
    include: ["src/**/*.test.{ts,tsx}"],
    restoreMocks: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
