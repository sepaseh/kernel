import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { i18nInstance } from "@/i18n";
import { server } from "@/test/mocks/server";

import { fetchUsers } from "./user";

vi.mock("@/i18n", () => ({
  i18nInstance: { t: (key: string) => key },
}));

describe("users API", () => {
  it("serializes filters and converts the response to camel case", async () => {
    server.use(
      http.get("http://localhost/users", ({ request }) => {
        const url = new URL(request.url);

        expect(url.searchParams.get("offset")).toBe("12");
        expect(url.searchParams.get("size")).toBe("12");

        return HttpResponse.json({
          items: [
            {
              email: null,
              first_name: "Ada",
              id: "user-1",
              is_system_admin: false,
              last_name: "Lovelace",
              mobile: "09120000000",
              personnel_code: "100",
              status: "active",
              username: "ada",
            },
          ],
          total: 1,
        });
      }),
    );

    await expect(fetchUsers({ offset: "12", size: "12" })).resolves.toEqual({
      items: [
        {
          email: null,
          firstName: "Ada",
          id: "user-1",
          isSystemAdmin: false,
          lastName: "Lovelace",
          mobile: "09120000000",
          personnelCode: "100",
          status: "active",
          username: "ada",
        },
      ],
      total: 1,
    });
  });

  it("localizes network errors", async () => {
    server.use(http.get("http://localhost/users", () => HttpResponse.error()));

    await expect(fetchUsers({})).rejects.toThrow(
      i18nInstance.t("networkError"),
    );
  });

  it("localizes unexpected API responses", async () => {
    server.use(
      http.get("http://localhost/users", () =>
        HttpResponse.json(null, { status: 500 }),
      ),
    );

    await expect(fetchUsers({})).rejects.toThrow(
      i18nInstance.t("unexpectedError"),
    );
  });
});
