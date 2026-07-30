import { delay, http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { server } from "@/test/mocks/server";

import { apiClient, setUnauthorizedHandler } from "./instance";
import { clearAccessToken, getAccessToken, setAccessToken } from "./token";

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

    setAccessToken("expired-token");
    setUnauthorizedHandler(onUnauthorized);
    server.use(
      http.get("http://localhost/protected/:id", () =>
        HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
      ),
      http.post("http://localhost/auth/refresh-token", async () => {
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
  });
});
