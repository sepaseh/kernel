import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { syntheticCredential } from "./fixtures";

const accountResponse = {
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

const fillOtp = async (page: Page, otp: string) => {
  for (const [index, digit] of [...otp].entries()) {
    await page
      .getByRole("textbox", { name: `OTP Input ${index + 1}` })
      .fill(digit);
  }
};

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
        password: syntheticCredential,
      });

      await route.fulfill({
        contentType: "application/json",
        json: { message: "Invalid credentials" },
        status: 401,
      });
    });
    await page.goto("/auth");

    await page.getByLabel("Username, email, or mobile").fill("ada");
    await page.getByLabel("Password").fill(syntheticCredential);
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
        json: accountResponse,
      });
    });
    await page.goto("/auth");

    await page.getByLabel("Username, email, or mobile").fill("ada");
    await page.getByLabel("Password").fill(syntheticCredential);
    await page.getByRole("button", { name: "Enter" }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("link", { name: "kernel" })).toBeVisible();
  });

  test("recovers a forgotten password and returns to login", async ({
    page,
  }) => {
    await page.route(
      "https://api.example.com/auth/otp-request",
      async (route) => {
        expect(route.request().postDataJSON()).toEqual({
          mobile: "09120000000",
          purpose: "forgot_password",
        });
        await route.fulfill({
          contentType: "application/json",
          json: { expires_in: 300, remaining_seconds: 60 },
        });
      },
    );
    await page.route(
      "https://api.example.com/auth/forgot-password",
      async (route) => {
        expect(route.request().postDataJSON()).toEqual({
          mobile: "09120000000",
          otp: "123456",
          password: syntheticCredential,
        });
        await route.fulfill({ status: 204 });
      },
    );
    await page.goto("/auth/forgot-password");

    await page.getByLabel("Mobile").fill("09120000000");
    await page.getByRole("button", { name: "Send code" }).click();
    await expect(page.getByText("Verification code sent.")).toBeVisible();
    await fillOtp(page, "123456");
    await page.getByLabel("New password").fill(syntheticCredential);
    await page.getByLabel("Confirm password").fill(syntheticCredential);
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page).toHaveURL(/\/auth$/);
  });

  test("registers a new account and enters the application", async ({
    page,
  }) => {
    await page.route(
      "https://api.example.com/auth/otp-request",
      async (route) => {
        expect(route.request().postDataJSON()).toEqual({
          mobile: "09120000000",
          purpose: "register",
        });
        await route.fulfill({
          contentType: "application/json",
          json: { expires_in: 300, remaining_seconds: 60 },
        });
      },
    );
    await page.route("https://api.example.com/auth/register", async (route) => {
      expect(route.request().postDataJSON()).toEqual({
        first_name: "Ada",
        last_name: "Lovelace",
        mobile: "09120000000",
        otp: "123456",
        password: syntheticCredential,
      });
      await route.fulfill({
        contentType: "application/json",
        json: { access_token: "registered-token" },
      });
    });
    await page.route("https://api.example.com/account/me", async (route) => {
      expect(route.request().headers().authorization).toBe(
        "Bearer registered-token",
      );
      await route.fulfill({
        contentType: "application/json",
        json: accountResponse,
      });
    });
    await page.goto("/auth/register");

    await page.getByLabel("First name").fill("Ada");
    await page.getByLabel("Last name").fill("Lovelace");
    await page.getByLabel("Mobile").fill("09120000000");
    await page.getByRole("button", { name: "Send code" }).click();
    await fillOtp(page, "123456");
    await page
      .getByLabel("Password", { exact: true })
      .fill(syntheticCredential);
    await page.getByLabel("Confirm password").fill(syntheticCredential);
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("link", { name: "kernel" })).toBeVisible();
  });

  test("logs out and returns to login", async ({ page }) => {
    await page.route("https://api.example.com/auth/login", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: { access_token: "access-token" },
      });
    });
    await page.route("https://api.example.com/account/me", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: accountResponse,
      });
    });
    await page.route("https://api.example.com/auth/logout", async (route) => {
      expect(route.request().headers().authorization).toBe(
        "Bearer access-token",
      );
      await route.fulfill({ status: 204 });
    });
    await page.goto("/auth");
    await page.getByLabel("Username, email, or mobile").fill("ada");
    await page.getByLabel("Password").fill(syntheticCredential);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page.getByRole("link", { name: "kernel" })).toBeVisible();

    await page.getByRole("button", { name: "Account" }).click();
    await page.getByRole("menuitem", { name: "Logout" }).click();

    await expect(page).toHaveURL(/\/auth$/);
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
  });

  test("redirects unauthenticated users away from protected routes", async ({
    page,
  }) => {
    await page.route("https://api.example.com/account/me", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: { message: "Unauthorized" },
        status: 401,
      });
    });
    await page.route(
      "https://api.example.com/auth/refresh-token",
      async (route) => {
        await route.fulfill({
          contentType: "application/json",
          json: { message: "Unauthorized" },
          status: 401,
        });
      },
    );

    await page.goto("/users");

    await expect(page).toHaveURL(/\/auth$/);
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
  });
});
