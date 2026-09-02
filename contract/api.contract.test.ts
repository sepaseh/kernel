import path from "node:path";

import { Pact } from "@pact-foundation/pact";
import { afterEach, describe, expect, it, vi } from "vitest";

const createPact = () =>
  new Pact({
    consumer: "kernel-web",
    dir: path.resolve("pacts"),
    provider: "kernel-api",
  });

const loadApiFor = async (baseUrl: string) => {
  vi.resetModules();
  vi.stubEnv("VITE_API_BASE_URL", baseUrl);

  return Promise.all([
    import("@/features/account/api"),
    import("@/features/auth/api"),
    import("@/shared/api"),
  ]);
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Kernel API consumer contract", () => {
  it("logs in with the expected request and token response", async () => {
    await createPact()
      .addInteraction()
      .given("a valid user exists")
      .uponReceiving("a login request")
      .withRequest("POST", "/auth/login", (request) => {
        request.jsonBody({
          identifier: "ada",
          password: "correct horse battery staple",
        });
      })
      .willRespondWith(200, (response) => {
        response.jsonBody({
          access_token: "access-token",
        });
      })
      .executeTest(async ({ url }) => {
        const [, { login }] = await loadApiFor(url);

        await expect(
          login({
            identifier: "ada",
            password: "correct horse battery staple",
          }),
        ).resolves.toEqual({ accessToken: "access-token" });
      });
  });

  it("reads the authenticated account response", async () => {
    await createPact()
      .addInteraction()
      .given("an authenticated account exists")
      .uponReceiving("an account details request")
      .withRequest("GET", "/account/me", (request) => {
        request.headers({
          Authorization: "Bearer access-token",
        });
      })
      .willRespondWith(200, (response) => {
        response.jsonBody({
          email: "ada@example.com",
          first_name: "Ada",
          id: "user-1",
          is_system_admin: false,
          last_name: "Lovelace",
          mobile: "09121111111",
          permissions: ["users.read"],
          status: "active",
          username: "ada",
        });
      })
      .executeTest(async ({ url }) => {
        const [{ getAccount }, , { setAccessToken }] = await loadApiFor(url);

        setAccessToken("access-token");

        await expect(getAccount()).resolves.toEqual({
          email: "ada@example.com",
          firstName: "Ada",
          id: "user-1",
          isSystemAdmin: false,
          lastName: "Lovelace",
          mobile: "09121111111",
          permissions: ["users.read"],
          status: "active",
          username: "ada",
        });
      });
  });
});
