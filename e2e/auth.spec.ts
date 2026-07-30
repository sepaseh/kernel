import { expect, test } from "@playwright/test";

test.describe("public authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("language", "en");
    });
  });

  test("shows the login form and public account recovery links", async ({
    page,
  }) => {
    await page.goto("/auth");

    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
    await expect(page.getByLabel("Username, email, or mobile")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Create account" }),
    ).toHaveAttribute("href", "/auth/register");
    await expect(
      page.getByRole("link", { name: "Forgot password?" }),
    ).toHaveAttribute("href", "/auth/forgot-password");
  });

  test("shows the API error when credentials are rejected", async ({
    page,
  }) => {
    await page.route("https://api.example.com/auth/login", async (route) => {
      expect(route.request().postDataJSON()).toEqual({
        identifier: "ada",
        password: "incorrect",
      });

      await route.fulfill({
        contentType: "application/json",
        json: { message: "Invalid credentials" },
        status: 401,
      });
    });
    await page.goto("/auth");

    await page.getByLabel("Username, email, or mobile").fill("ada");
    await page.getByLabel("Password").fill("incorrect");
    await page.getByRole("button", { name: "Enter" }).click();

    await expect(page.getByText("Invalid credentials")).toBeVisible();
    await expect(page).toHaveURL(/\/auth$/);
  });

  test("logs in and loads the authenticated account", async ({ page }) => {
    await page.route("https://api.example.com/auth/login", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: { access_token: "access-token" },
      });
    });
    await page.route("https://api.example.com/account/me", async (route) => {
      expect(route.request().headers().authorization).toBe(
        "Bearer access-token",
      );

      await route.fulfill({
        contentType: "application/json",
        json: {
          email: "ada@example.com",
          first_name: "Ada",
          id: "user-1",
          is_system_admin: true,
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

    await page.getByLabel("Username, email, or mobile").fill("ada");
    await page.getByLabel("Password").fill("correct-password");
    await page.getByRole("button", { name: "Enter" }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("link", { name: "kernel" })).toBeVisible();
  });
});
