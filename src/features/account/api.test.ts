import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/shared/api";

import {
  getAccount,
  requestEmailVerification,
  updateProfile,
  updateUsername,
  verifyEmail,
} from "./api";

vi.mock("@/shared/api", () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

beforeEach(() => {
  vi.mocked(apiClient.get).mockResolvedValue({});
  vi.mocked(apiClient.patch).mockResolvedValue({});
  vi.mocked(apiClient.post).mockResolvedValue({});
});

describe("account API", () => {
  it("uses the account endpoint", async () => {
    await getAccount();

    expect(apiClient.get).toHaveBeenCalledWith("/account/me");
  });

  it("requests and verifies email changes", async () => {
    await requestEmailVerification({ email: "ada@example.com" });
    await verifyEmail({ email: "ada@example.com", otp: "123456" });

    expect(apiClient.post).toHaveBeenNthCalledWith(
      1,
      "/account/request-email-verification",
      { email: "ada@example.com" },
    );
    expect(apiClient.post).toHaveBeenNthCalledWith(2, "/account/verify-email", {
      email: "ada@example.com",
      otp: "123456",
    });
  });

  it("updates profile and username fields", async () => {
    await updateProfile({ firstName: "Ada", lastName: "Lovelace" });
    await updateUsername({ username: "ada" });

    expect(apiClient.patch).toHaveBeenCalledWith("/account/update-profile", {
      firstName: "Ada",
      lastName: "Lovelace",
    });
    expect(apiClient.post).toHaveBeenCalledWith("/account/update-username", {
      username: "ada",
    });
  });
});
