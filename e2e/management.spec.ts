import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

type RoleRecord = {
  id: string;
  name: string;
  permissions: string[];
};

type UserRecord = {
  email?: string;
  first_name: string;
  id: string;
  is_system_admin: boolean;
  last_name: string;
  mobile: string;
  roles: Array<Pick<RoleRecord, "id" | "name">>;
  status: "active" | "inactive";
  username?: string;
};

const mockAccount = async (
  page: Page,
  permissions: string[],
  isSystemAdmin = false,
) => {
  await page.route("http://api.example.com/account/me", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        email: "manager@example.com",
        first_name: "Test",
        id: "manager-1",
        is_system_admin: isSystemAdmin,
        last_name: "Manager",
        mobile: "09120000000",
        permissions,
        status: "active",
        username: "manager",
      },
    });
  });
};

test.describe("role and user management", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("language", "en");
    });
  });

  test("creates a role after validation and assigns permissions", async ({
    page,
  }) => {
    const roles: RoleRecord[] = [];
    let createRequestCount = 0;

    await mockAccount(page, ["roles.create", "roles.read"]);
    await page.route(
      "http://api.example.com/roles/permissions",
      async (route) => {
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
      },
    );
    await page.route("http://api.example.com/roles", async (route) => {
      if (route.request().method() === "POST") {
        createRequestCount += 1;
        expect(route.request().postDataJSON()).toEqual({
          name: "Operators",
          permissions: ["users.read"],
        });
        roles.push({
          id: "role-1",
          name: "Operators",
          permissions: ["users.read"],
        });
        await route.fulfill({
          contentType: "application/json",
          json: roles[0],
        });
        return;
      }

      await route.fulfill({ contentType: "application/json", json: roles });
    });
    await page.goto("/roles");
    await expect(page.getByRole("link", { name: "Logo" })).toBeVisible();

    await page.getByRole("button", { name: "Create" }).click();
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Please enter Name")).toBeVisible();
    expect(createRequestCount).toBe(0);

    await page.getByLabel("Name").fill("Operators");
    await page.getByLabel("Read users").click();
    await expect(page.getByLabel("Read users")).toBeChecked();
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page.getByText("Role created successfully.")).toBeVisible();
    await expect(page.getByText("Operators")).toBeVisible();
    expect(createRequestCount).toBe(1);
  });

  test("updates and deletes a role after confirmation", async ({ page }) => {
    const roles: RoleRecord[] = [
      {
        id: "role-1",
        name: "Operators",
        permissions: ["users.read"],
      },
    ];

    await mockAccount(page, ["roles.delete", "roles.read", "roles.update"]);
    await page.route(
      "http://api.example.com/roles/permissions",
      async (route) => {
        await route.fulfill({ contentType: "application/json", json: [] });
      },
    );
    await page.route("http://api.example.com/roles", async (route) => {
      await route.fulfill({ contentType: "application/json", json: roles });
    });
    await page.route("http://api.example.com/roles/role-1", async (route) => {
      if (route.request().method() === "PATCH") {
        expect(route.request().postDataJSON()).toEqual({
          name: "Support",
          permissions: ["users.read"],
        });
        roles[0] = { ...roles[0], name: "Support" };
        await route.fulfill({
          contentType: "application/json",
          json: roles[0],
        });
        return;
      }

      if (route.request().method() === "DELETE") {
        roles.splice(0, roles.length);
        await route.fulfill({ status: 204 });
        return;
      }

      await route.fulfill({
        contentType: "application/json",
        json: roles[0],
      });
    });
    await page.goto("/roles");
    const roleRow = page.getByRole("row", { name: /Operators/ });

    await roleRow.getByRole("button", { name: "Update" }).click();
    await page.getByLabel("Name").fill("Support");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Role updated successfully.")).toBeVisible();
    await expect(page.getByText("Support")).toBeVisible();

    await page
      .getByRole("row", { name: /Support/ })
      .getByRole("button", { name: "Delete" })
      .click();
    await expect(
      page.getByRole("dialog", {
        name: "Are you sure you want to delete this role?",
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Yes" }).click();

    await expect(page.getByText("Role deleted successfully.")).toBeVisible();
    await expect(page.getByText("Support")).not.toBeVisible();
  });

  test("creates and updates a user, then displays a delete error", async ({
    page,
  }) => {
    const users: UserRecord[] = [];

    await mockAccount(page, [
      "users.create",
      "users.delete",
      "users.read",
      "users.update",
    ]);
    await page.route("http://api.example.com/roles", async (route) => {
      await route.fulfill({ contentType: "application/json", json: [] });
    });
    await page.route(
      /http:\/\/api\.example\.com\/users(?:\?.*)?$/,
      async (route) => {
        if (route.request().method() === "POST") {
          expect(route.request().postDataJSON()).toEqual({
            first_name: "Ada",
            last_name: "Lovelace",
            mobile: "09121111111",
            password: expect.any(String),
          });
          users.push({
            first_name: "Ada",
            id: "user-1",
            is_system_admin: false,
            last_name: "Lovelace",
            mobile: "09121111111",
            roles: [],
            status: "active",
          });
          await route.fulfill({
            contentType: "application/json",
            json: users[0],
          });
          return;
        }

        await route.fulfill({
          contentType: "application/json",
          json: { items: users, total: users.length },
        });
      },
    );
    await page.route("http://api.example.com/users/user-1", async (route) => {
      if (route.request().method() === "PATCH") {
        expect(route.request().postDataJSON()).toEqual({
          first_name: "Augusta",
          last_name: "Lovelace",
          mobile: "09121111111",
        });
        users[0] = { ...users[0], first_name: "Augusta" };
        await route.fulfill({
          contentType: "application/json",
          json: users[0],
        });
        return;
      }

      if (route.request().method() === "DELETE") {
        await route.fulfill({
          contentType: "application/json",
          json: { message: "User cannot be deleted" },
          status: 409,
        });
        return;
      }

      await route.fulfill({
        contentType: "application/json",
        json: users[0],
      });
    });
    await page.goto("/users");

    await page.getByRole("button", { name: "Create" }).click();
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Please enter First name")).toBeVisible();
    const createDialog = page.getByRole("dialog", { name: "Create" });
    await createDialog.getByRole("textbox").nth(0).fill("Ada");
    await createDialog.getByRole("textbox").nth(1).fill("Lovelace");
    await createDialog.getByRole("textbox").nth(2).fill("09121111111");
    await createDialog.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("User created successfully.")).toBeVisible();
    await expect(page.getByText("Ada Lovelace")).toBeVisible();

    await page
      .getByRole("row", { name: /Ada Lovelace/ })
      .getByRole("button", { name: "Update" })
      .click();
    const updateDialog = page.getByRole("dialog", { name: "Update" });
    await updateDialog.getByRole("textbox").nth(0).fill("Augusta");
    await updateDialog.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("User updated successfully.")).toBeVisible();
    await expect(page.getByText("Augusta Lovelace")).toBeVisible();

    await page
      .getByRole("row", { name: /Augusta Lovelace/ })
      .getByRole("button", { name: "Delete" })
      .click();
    await expect(
      page.getByRole("dialog", {
        name: "Are you sure you want to delete this user?",
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Yes" }).click();
    await expect(page.getByText("User cannot be deleted")).toBeVisible();
  });

  test("hides mutation controls from a read-only user", async ({ page }) => {
    await mockAccount(page, ["users.read"]);
    await page.route(
      /http:\/\/api\.example\.com\/users(?:\?.*)?$/,
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
                roles: [],
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

    await expect(page.getByRole("button", { name: "Create" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Update" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Delete" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Active" })).toHaveCount(0);
  });
});
