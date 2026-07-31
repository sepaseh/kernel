import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  changePassword,
  forgotPassword,
  login,
  logout,
  register,
  requestOtp,
} from "./auth";
import { apiClient } from "./instance";
import { clearAccessToken, setAccessToken } from "./token";

vi.mock("./instance", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

vi.mock("./token", () => ({
  clearAccessToken: vi.fn(),
  setAccessToken: vi.fn(),
}));

const currentCredential = "current-test-credential";
const replacementCredential = "replacement-test-credential";
const syntheticCredential = "synthetic-test-credential";

beforeEach(() => {
  vi.mocked(apiClient.post).mockResolvedValue({});
});

describe("authentication API", () => {
  it("stores access tokens returned by login and registration", async () => {
    vi.mocked(apiClient.post)
      .mockResolvedValueOnce({ accessToken: "login-token" })
      .mockResolvedValueOnce({ accessToken: "register-token" });

    await expect(
      login({ identifier: "ada", password: syntheticCredential }),
    ).resolves.toEqual({ accessToken: "login-token" });
    await expect(
      register({
        firstName: "Ada",
        lastName: "Lovelace",
        mobile: "09120000000",
        otp: "123456",
        password: syntheticCredential,
      }),
    ).resolves.toEqual({ accessToken: "register-token" });

    expect(setAccessToken).toHaveBeenNthCalledWith(1, "login-token");
    expect(setAccessToken).toHaveBeenNthCalledWith(2, "register-token");
  });

  it("clears the access token when logout succeeds or fails", async () => {
    await logout();

    vi.mocked(apiClient.post).mockRejectedValueOnce(new Error("offline"));
    await expect(logout()).rejects.toThrow("offline");

    expect(apiClient.post).toHaveBeenNthCalledWith(1, "/auth/logout");
    expect(apiClient.post).toHaveBeenNthCalledWith(2, "/auth/logout");
    expect(clearAccessToken).toHaveBeenCalledTimes(2);
  });

  it("submits password and OTP operations to their endpoints", async () => {
    await changePassword({
      currentPassword: currentCredential,
      newPassword: replacementCredential,
    });
    await forgotPassword({
      mobile: "09120000000",
      otp: "123456",
      password: replacementCredential,
    });
    await requestOtp({ mobile: "09120000000", purpose: "login" });

    expect(apiClient.post).toHaveBeenNthCalledWith(1, "/auth/change-password", {
      currentPassword: currentCredential,
      newPassword: replacementCredential,
    });
    expect(apiClient.post).toHaveBeenNthCalledWith(2, "/auth/forgot-password", {
      mobile: "09120000000",
      otp: "123456",
      password: replacementCredential,
    });
    expect(apiClient.post).toHaveBeenNthCalledWith(3, "/auth/otp-request", {
      mobile: "09120000000",
      purpose: "login",
    });
  });
});
