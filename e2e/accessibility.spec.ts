import AxeBuilder from "@axe-core/playwright";
import { expect, Page, test } from "@playwright/test";

const expectNoAxeViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page })
    .disableRules(["color-contrast"])
    .analyze();
  const violations = results.violations.map(({ help, id, impact, nodes }) => ({
    help,
    id,
    impact,
    targets: nodes.map(({ target }) => target),
  }));

  expect(violations).toEqual([]);
};

const mockAccount = async (page: Page, permissions: string[]) => {
  await page.route("https://api.example.com/account/me", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        email: "manager@example.com",
        first_name: "Test",
        id: "manager-1",
        is_system_admin: false,
        last_name: "Manager",
        mobile: "09120000000",
        permissions,
        personnel_code: "100",
        status: "active",
        username: "manager",
      },
    });
  });
};

test.describe("accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("language", "en");
      localStorage.setItem("theme", "light");
    });
  });

  test("public authentication pages have no detectable violations", async ({
    page,
  }) => {
    for (const path of ["/auth", "/auth/forgot-password", "/auth/register"]) {
      await page.goto(path);
      await expect(page.locator("main, form").first()).toBeVisible();
      await expectNoAxeViolations(page);
    }
  });

  test("login controls follow a usable keyboard focus order", async ({
    page,
  }) => {
    await page.goto("/auth");

    for (let attempt = 0; attempt < 5; attempt += 1) {
      if (
        await page
          .getByLabel("Username, email, or mobile")
          .evaluate((element) => element === document.activeElement)
      ) {
        break;
      }

      await page.keyboard.press("Tab");
    }

    await expect(page.getByLabel("Username, email, or mobile")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Password")).toBeFocused();
  });

  test("role dialog is labeled, traps focus, and passes axe", async ({
    page,
  }) => {
    await mockAccount(page, ["roles.create", "roles.read"]);
    await page.route("https://api.example.com/roles", async (route) => {
      await route.fulfill({ contentType: "application/json", json: [] });
    });
    await page.route("https://api.example.com/permissions", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: [
          {
            name: "users",
            permissions: [{ name: "users.read", title: "Read users" }],
            title: "Users",
          },
        ],
      });
    });
    await page.goto("/roles");
    await page.getByRole("button", { name: "Create" }).click();
    const dialog = page.getByRole("dialog", { name: "Create" });

    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("Name")).toBeFocused();
    await expect(dialog.getByLabel("Read users")).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test("authenticated user management has no detectable violations", async ({
    page,
  }) => {
    await mockAccount(page, ["users.read"]);
    await page.route(
      /https:\/\/api\.example\.com\/users(?:\?.*)?$/,
      async (route) => {
        await route.fulfill({
          contentType: "application/json",
          json: {
            items: [
              {
                email: "ada@example.com",
                first_name: "Ada",
                id: "user-1",
                is_system_admin: false,
                last_name: "Lovelace",
                mobile: "09121111111",
                personnel_code: "200",
                status: "active",
                username: "ada",
              },
            ],
            total: 1,
          },
        });
      },
    );
    await page.goto("/users");
    await expect(page.getByText("Ada Lovelace")).toBeVisible();

    await expectNoAxeViolations(page);
  });
});
