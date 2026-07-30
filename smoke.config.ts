import { defineConfig, devices } from "@playwright/test";

const deploymentUrl = new URL(
  process.env.SMOKE_BASE_URL ?? "https://smoke-target.invalid/",
);

if (!deploymentUrl.pathname.endsWith("/")) {
  deploymentUrl.pathname += "/";
}

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  forbidOnly: true,
  globalSetup: "./smoke/setup.ts",
  outputDir: "test-results/smoke",
  projects: [
    {
      name: "deployed-chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(process.env.CI ? {} : { channel: "chrome" as const }),
      },
    },
  ],
  reporter: [
    ["line"],
    ["html", { open: "never", outputFolder: "playwright-report/smoke" }],
  ],
  retries: process.env.CI ? 2 : 0,
  testDir: "./smoke",
  use: {
    baseURL: deploymentUrl.href,
    ignoreHTTPSErrors: process.env.SMOKE_IGNORE_HTTPS_ERRORS === "true",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  workers: 1,
});
