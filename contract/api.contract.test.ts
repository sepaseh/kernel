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
  it("surfaces a recovery password-policy rejection", async () => {
    await createPact()
      .addInteraction()
      .given("a recovery OTP exists and the password is too short")
      .uponReceiving("a recovery request outside the password policy")
      .withRequest("POST", "/auth/forgot-password", (request) => {
        request.jsonBody({
          mobile: "09120000002",
          otp: "123456",
          password: "short",
        });
      })
      .willRespondWith(400, (response) => {
        response.jsonBody({ message: "Password reset data is invalid." });
      })
      .executeTest(async ({ url }) => {
        const [, { forgotPassword }] = await loadApiFor(url);
        await expect(
          forgotPassword({
            mobile: "09120000002",
            otp: "123456",
            password: "short",
          }),
        ).rejects.toThrow("Password reset data is invalid.");
      });
  });

  it("surfaces the conflict when demoting the final administrator", async () => {
    await createPact()
      .addInteraction()
      .given("the target is the final active system administrator")
      .uponReceiving("a demotion of the final active administrator")
      .withRequest("PATCH", "/users/user-1/system-admin", (request) => {
        request.headers({ Authorization: "Bearer access-token" });
        request.jsonBody({ is_system_admin: false });
      })
      .willRespondWith(409, (response) => {
        response.jsonBody({
          message: "The final system administrator cannot be deleted.",
        });
      })
      .executeTest(async ({ url }) => {
        const [, , { setAccessToken }] = await loadApiFor(url);
        const { updateUserSystemAdmin } = await import("@/features/users/api");
        setAccessToken("access-token");
        await expect(
          updateUserSystemAdmin("user-1", { isSystemAdmin: false }),
        ).rejects.toThrow("The final system administrator cannot be deleted.");
      });
  });

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
