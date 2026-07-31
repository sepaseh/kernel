import { expect, test } from "@playwright/test";

const apiHealthUrl = process.env.SMOKE_API_HEALTH_URL;

if (!apiHealthUrl) throw new Error("SMOKE_API_HEALTH_URL is required");

test("loads the application and its static assets", async ({ page }) => {
  const applicationOrigin = new URL(test.info().project.use.baseURL as string)
    .origin;
  const assetResponses: { ok: boolean; url: string }[] = [];

  page.on("response", (response) => {
    const resourceType = response.request().resourceType();

    if (
      ["font", "script", "stylesheet"].includes(resourceType) &&
      new URL(response.url()).origin === applicationOrigin
    ) {
      assetResponses.push({ ok: response.ok(), url: response.url() });
    }
  });

  const documentResponse = await page.goto("auth");

  expect(documentResponse?.ok()).toBe(true);
  await expect(page).toHaveTitle("kernel");
  await expect(page.locator("#root > *").first()).toBeVisible();
  expect(assetResponses.length).toBeGreaterThan(0);
  expect(assetResponses.filter(({ ok }) => !ok)).toEqual([]);
});

test("supports direct navigation to a client-side route", async ({ page }) => {
  const response = await page.goto("auth/register");

  expect(response?.ok()).toBe(true);
  await expect(page.locator("form")).toBeVisible();
  await expect(page).toHaveURL(/\/auth\/register\/?$/);
});

test("reaches the deployed API health endpoint", async ({ request }) => {
  const response = await request.get(apiHealthUrl, {
    failOnStatusCode: false,
  });

  expect(response.ok()).toBe(true);
});
