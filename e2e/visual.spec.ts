import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const account = {
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
};

const preparePage = async (page: Page) => {
  await page.addInitScript(() => {
    localStorage.setItem("language", "en");
    localStorage.setItem("theme", "light");
  });
};

const mockAuthenticatedPage = async (page: Page) => {
  await page.route("https://api.example.com/account/me", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: account,
    });
  });
};

test.describe("visual regression", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("login page", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
    await expect(page).toHaveScreenshot("login.png", { fullPage: true });
  });

  test("forgot password page", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await expect(
      page.getByRole("heading", { name: "Forgot password" }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot("forgot-password.png", {
      fullPage: true,
    });
  });

  test("registration page", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(page.getByRole("heading", { name: "Register" })).toBeVisible();
    await expect(page).toHaveScreenshot("register.png", { fullPage: true });
  });

  test("authenticated layout and users table", async ({ page }) => {
    await mockAuthenticatedPage(page);
    await page.route(
      /https:\/\/api\.example\.com\/users(?:\?.*)?$/,
      async (route) => {
        await route.fulfill({
          contentType: "application/json",
          json: {
            items: [
              {
                ...account,
                is_system_admin: false,
              },
              {
                email: "grace@example.com",
                first_name: "Grace",
                id: "user-2",
                is_system_admin: false,
                last_name: "Hopper",
                mobile: "09121111111",
                personnel_code: "101",
                status: "inactive",
                username: "grace",
              },
            ],
            total: 2,
          },
        });
      },
    );

    await page.goto("/users");
    await expect(page.getByText("Ada Lovelace")).toBeVisible();
    await expect(page.getByText("Grace Hopper")).toBeVisible();
    await expect(page).toHaveScreenshot("users-table.png", { fullPage: true });
  });

  test("create role form", async ({ page }) => {
    await mockAuthenticatedPage(page);
    await page.route("https://api.example.com/permissions", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: [
          {
            name: "users",
            permissions: [
              { name: "users.read", title: "Read users" },
              { name: "users.update", title: "Update users" },
            ],
            title: "Users",
          },
        ],
      });
    });
    await page.route("https://api.example.com/roles", async (route) => {
      await route.fulfill({ contentType: "application/json", json: [] });
    });

    await page.goto("/roles");
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page.getByRole("dialog", { name: "Create" })).toBeVisible();
    await expect(page).toHaveScreenshot("create-role.png", { fullPage: true });
  });
});
