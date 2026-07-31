import { expect, test } from "@playwright/test";

import { syntheticCredential } from "./fixtures";

const locales = [
  {
    direction: "ltr",
    enter: "Enter",
    identifier: "Username, email, or mobile",
    language: "en",
    login: "Login",
    password: "Password",
  },
  {
    direction: "rtl",
    enter: "ورود",
    identifier: "نام کاربری، ایمیل یا موبایل",
    language: "fa",
    login: "ورود به سیستم",
    password: "رمز عبور",
  },
] as const;

test.describe("localized critical journeys", () => {
  for (const locale of locales) {
    test(`logs in using ${locale.language.toUpperCase()}/${locale.direction.toUpperCase()}`, async ({
      page,
    }) => {
      await page.addInitScript((language) => {
        localStorage.setItem("language", language);
        localStorage.setItem("theme", "light");
      }, locale.language);
      await page.route("https://api.example.com/auth/login", async (route) => {
        expect(route.request().postDataJSON()).toEqual({
          identifier: "ada",
          password: syntheticCredential,
        });
        await route.fulfill({
          contentType: "application/json",
          json: { access_token: "access-token" },
        });
      });
      await page.route("https://api.example.com/account/me", async (route) => {
        await route.fulfill({
          contentType: "application/json",
          json: {
            email: "ada@example.com",
            first_name: "Ada",
            id: "user-1",
            is_system_admin: false,
            last_name: "Lovelace",
            mobile: "09120000000",
            permissions: [],
            personnel_code: "100",
            status: "active",
            username: "ada",
          },
        });
      });
      await page.goto("/auth");

      await expect(page.locator("html")).toHaveAttribute(
        "dir",
        locale.direction,
      );
      await expect(page.locator("html")).toHaveAttribute(
        "lang",
        locale.language,
      );
      await expect(
        page.getByRole("heading", { name: locale.login }),
      ).toBeVisible();
      await page.getByLabel(locale.identifier).fill("ada");
      await page.getByLabel(locale.password).fill(syntheticCredential);
      await page.getByRole("button", { name: locale.enter }).click();

      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByRole("link", { name: "kernel" })).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute(
        "dir",
        locale.direction,
      );
    });
  }
});
