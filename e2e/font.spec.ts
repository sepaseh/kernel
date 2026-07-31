import { expect, test } from "@playwright/test";

test("loads Vazirmatn from the application origin", async ({ page }) => {
  const fontRequests: string[] = [];

  page.on("request", (request) => {
    if (request.resourceType() === "font") {
      fontRequests.push(request.url());
    }
  });

  await page.goto("/auth");

  const typography = await page.evaluate(async () => {
    await document.fonts.load("400 16px Vazirmatn");
    await document.fonts.ready;

    const vazirmatnFace = [...document.fonts].find(
      ({ family }) => family.replaceAll('"', "") === "Vazirmatn",
    );

    return {
      family: getComputedStyle(document.documentElement).fontFamily,
      fontStatus: vazirmatnFace?.status,
    };
  });

  expect(typography.family).toBe("Vazirmatn, system-ui, sans-serif");
  expect(typography.fontStatus).toBe("loaded");
  expect(fontRequests).toHaveLength(1);

  const applicationOrigin = new URL(page.url()).origin;
  const fontUrl = new URL(fontRequests[0]);

  expect(fontUrl.origin).toBe(applicationOrigin);
  expect(fontUrl.pathname).toMatch(/Vazirmatn-Variable-.*\.woff2$/);
});
