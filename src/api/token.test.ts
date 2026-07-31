import { beforeEach, describe, expect, it } from "vitest";

import { clearAccessToken, getAccessToken, setAccessToken } from "./token";

beforeEach(() => {
  clearAccessToken();
});

describe("access token", () => {
  it("is absent before a token is set", () => {
    expect(getAccessToken()).toBeNull();
  });

  it("stores and retrieves a token", () => {
    setAccessToken("access-token");

    expect(getAccessToken()).toBe("access-token");
  });

  it("clears a stored token", () => {
    setAccessToken("access-token");

    clearAccessToken();

    expect(getAccessToken()).toBeNull();
  });
});
