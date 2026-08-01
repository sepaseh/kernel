import { defineConfig, devices } from "@playwright/test";

const baseURL = "https://127.0.0.1:4173";

export default defineConfig({
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.01,
    },
    timeout: 5_000,
  },
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  outputDir: "test-results",
  projects: [
    {
      name: "chromium",
      testIgnore: /visual\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        ...(process.env.CI ? {} : { channel: "chrome" as const }),
      },
    },
    {
      name: "firefox",
      testIgnore: /visual\.spec\.ts/,
      use: devices["Desktop Firefox"],
    },
    {
      name: "webkit",
      testIgnore: /visual\.spec\.ts/,
      use: devices["Desktop Safari"],
    },
    {
      name: "mobile-chromium",
      testIgnore: /visual\.spec\.ts/,
      use: {
        ...devices["Pixel 7"],
        ...(process.env.CI ? {} : { channel: "chrome" as const }),
      },
    },
    {
      name: "visual-chromium",
      testMatch: /visual\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        ...(process.env.CI ? {} : { channel: "chrome" as const }),
      },
    },
  ],
  reporter: process.env.CI
    ? [["line"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  retries: process.env.CI ? 2 : 0,
  snapshotPathTemplate:
    "{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}",
  testDir: "./e2e",
  use: {
    baseURL,
    ignoreHTTPSErrors: true,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: process.env.CI ? "retain-on-failure" : "off",
  },
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4173",
    env: {
      ...process.env,
      VITE_API_BASE_URL: "https://api.example.com",
      VITE_APP_BASE_URL: "/",
      VITE_RELEASE_ID: "e2e",
    },
    ignoreHTTPSErrors: true,
    reuseExistingServer: false,
    timeout: 120_000,
    url: baseURL,
  },
  workers: process.env.CI ? 1 : undefined,
});
