import path from "node:path";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

import { srcPath } from "./tooling/paths.ts";

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  resolve: {
    alias: {
      "@": srcPath,
    },
  },
  test: {
    coverage: {
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.test.{ts,tsx}",
        "src/**/*.stories.{ts,tsx}",
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
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          clearMocks: true,
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
      },
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(import.meta.dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(
              process.env.CI ? {} : { launchOptions: { channel: "chrome" } },
            ),
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
        },
      },
    ],
  },
});
