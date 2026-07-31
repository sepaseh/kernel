import axios, { AxiosError } from "axios";
import { delay, http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { i18nInstance } from "@/i18n";
import { server } from "@/test/mocks/server";

import { apiClient, setUnauthorizedHandler } from "./instance";
import { clearAccessToken, getAccessToken, setAccessToken } from "./token";

const syntheticCredential = "synthetic-test-credential";

afterEach(() => {
  clearAccessToken();
  setUnauthorizedHandler(null);
});

describe("API client authentication", () => {
  it("adds the access token to protected requests", async () => {
    setAccessToken("access-token");
    server.use(
      http.get("http://localhost/protected", ({ request }) => {
        expect(request.headers.get("authorization")).toBe(
          "Bearer access-token",
        );

        return HttpResponse.json({ user_id: "user-1" });
      }),
    );

    await expect(
      apiClient.get<{ userId: string }>("/protected"),
    ).resolves.toEqual({ userId: "user-1" });
  });

  it("refreshes an expired token and retries the request once", async () => {
    let protectedRequestCount = 0;
    let refreshRequestCount = 0;

    setAccessToken("expired-token");
    server.use(
      http.get("http://localhost/protected", ({ request }) => {
        protectedRequestCount += 1;

        if (request.headers.get("authorization") === "Bearer fresh-token") {
          return HttpResponse.json({ status: "ready" });
        }

        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }),
      http.post("http://localhost/auth/refresh-token", () => {
        refreshRequestCount += 1;
        return HttpResponse.json({ access_token: "fresh-token" });
      }),
    );

    await expect(
      apiClient.get<{ status: string }>("/protected"),
    ).resolves.toEqual({ status: "ready" });
    expect(getAccessToken()).toBe("fresh-token");
    expect(protectedRequestCount).toBe(2);
    expect(refreshRequestCount).toBe(1);
  });

  it("shares one token refresh across concurrent unauthorized requests", async () => {
    let refreshRequestCount = 0;

    setAccessToken("expired-token");
    server.use(
      http.get("http://localhost/protected/:id", ({ request, params }) => {
        if (request.headers.get("authorization") === "Bearer fresh-token") {
          return HttpResponse.json({ id: params.id });
        }

        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }),
      http.post("http://localhost/auth/refresh-token", async () => {
        refreshRequestCount += 1;
        await delay(10);
        return HttpResponse.json({ access_token: "fresh-token" });
      }),
    );

    await expect(
      Promise.all([
        apiClient.get<{ id: string }>("/protected/one"),
        apiClient.get<{ id: string }>("/protected/two"),
      ]),
    ).resolves.toEqual([{ id: "one" }, { id: "two" }]);
    expect(refreshRequestCount).toBe(1);
  });

  it("clears authentication once when a shared token refresh fails", async () => {
    const onUnauthorized = vi.fn();
    let refreshRequestCount = 0;

    setAccessToken("expired-token");
    setUnauthorizedHandler(onUnauthorized);
    server.use(
      http.get("http://localhost/protected/:id", () =>
        HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
      ),
      http.post("http://localhost/auth/refresh-token", async () => {
        refreshRequestCount += 1;
        await delay(10);
        return HttpResponse.json(
          { message: "Refresh rejected" },
          { status: 401 },
        );
      }),
    );

    const results = await Promise.allSettled([
      apiClient.get("/protected/one"),
      apiClient.get("/protected/two"),
    ]);

    expect(results.every(({ status }) => status === "rejected")).toBe(true);
    expect(getAccessToken()).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledOnce();
    expect(refreshRequestCount).toBe(1);
  });

  it("clears authentication when a single token refresh fails", async () => {
    const onUnauthorized = vi.fn();
    let protectedRequestCount = 0;
    let refreshRequestCount = 0;

    setAccessToken("expired-token");
    setUnauthorizedHandler(onUnauthorized);
    server.use(
      http.get("http://localhost/protected", () => {
        protectedRequestCount += 1;
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }),
      http.post("http://localhost/auth/refresh-token", () => {
        refreshRequestCount += 1;
        return HttpResponse.json(
          { message: "Refresh rejected" },
          { status: 401 },
        );
      }),
    );

    await expect(apiClient.get("/protected")).rejects.toThrow("Unauthorized");
    expect(protectedRequestCount).toBe(1);
    expect(refreshRequestCount).toBe(1);
    expect(getAccessToken()).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it("does not start another refresh when the retried request is unauthorized", async () => {
    const onUnauthorized = vi.fn();
    let protectedRequestCount = 0;
    let refreshRequestCount = 0;

    setAccessToken("expired-token");
    setUnauthorizedHandler(onUnauthorized);
    server.use(
      http.get("http://localhost/protected", () => {
        protectedRequestCount += 1;
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }),
      http.post("http://localhost/auth/refresh-token", () => {
        refreshRequestCount += 1;
        return HttpResponse.json({ access_token: "fresh-token" });
      }),
    );

    await expect(apiClient.get("/protected")).rejects.toThrow("Unauthorized");
    expect(protectedRequestCount).toBe(2);
    expect(refreshRequestCount).toBe(1);
    expect(getAccessToken()).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it("does not refresh or clear authentication for public auth requests", async () => {
    const onUnauthorized = vi.fn();
    const refresh = vi.fn();

    setUnauthorizedHandler(onUnauthorized);
    server.use(
      http.post("http://localhost/auth/login", () =>
        HttpResponse.json({ message: "Invalid credentials" }, { status: 401 }),
      ),
      http.post("http://localhost/auth/refresh-token", refresh),
    );

    await expect(
      apiClient.post("/auth/login", {
        identifier: "ada",
        password: syntheticCredential,
      }),
    ).rejects.toThrow("Invalid credentials");
    expect(refresh).not.toHaveBeenCalled();
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});

describe("API client errors", () => {
  it("transforms structured API errors and preserves their cause", async () => {
    server.use(
      http.get("http://localhost/invalid-request", () =>
        HttpResponse.json(
          {
            cause: { email: "Email is invalid" },
            message: "Validation failed",
          },
          { status: 422 },
        ),
      ),
    );

    await expect(apiClient.get("/invalid-request")).rejects.toMatchObject({
      cause: { email: "Email is invalid" },
      message: "Validation failed",
    });
  });

  it.each([
    ["null", null],
    ["primitive", "failure"],
    ["array", []],
    ["missing message", {}],
    ["empty message", { message: "" }],
    ["non-string message", { message: 500 }],
  ])(
    "uses the unexpected-error message for a %s response body",
    async (label, body) => {
      const path = `/malformed-error/${label.replaceAll(" ", "-")}`;
      server.use(
        http.get(`http://localhost${path}`, () =>
          HttpResponse.json(body, { status: 500 }),
        ),
      );

      await expect(apiClient.get(path)).rejects.toThrow(
        i18nInstance.t("unexpectedError"),
      );
    },
  );

  it("preserves request cancellation", async () => {
    const controller = new AbortController();

    server.use(
      http.get("http://localhost/cancelled", async () => {
        await delay(100);
        return HttpResponse.json({ status: "ready" });
      }),
    );

    const request = apiClient.get("/cancelled", {
      signal: controller.signal,
    });
    controller.abort();

    await expect(request).rejects.toSatisfy((error: unknown) =>
      axios.isCancel(error),
    );
  });

  it("uses the network-error message when a request times out", async () => {
    await expect(
      apiClient.get("/slow", {
        adapter: (config) =>
          Promise.reject(
            new AxiosError(
              "timeout exceeded",
              AxiosError.ETIMEDOUT,
              config,
              {},
            ),
          ),
      }),
    ).rejects.toThrow(i18nInstance.t("networkError"));
  });

  it("uses the network-error message for network failures", async () => {
    server.use(
      http.get("http://localhost/network-failure", () => HttpResponse.error()),
    );

    await expect(apiClient.get("/network-failure")).rejects.toThrow(
      i18nInstance.t("networkError"),
    );
  });
});
