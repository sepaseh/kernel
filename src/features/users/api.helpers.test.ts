import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/shared/api";

import * as users from "./api";

vi.mock("@/shared/api", () => ({
  apiClient: {
    del: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

beforeEach(() => {
  vi.mocked(apiClient.del).mockResolvedValue(undefined);
  vi.mocked(apiClient.get).mockResolvedValue(undefined);
  vi.mocked(apiClient.patch).mockResolvedValue(undefined);
  vi.mocked(apiClient.post).mockResolvedValue(undefined);
  vi.mocked(apiClient.put).mockResolvedValue(undefined);
});

describe("user API helper contracts", () => {
  it("maps create, read, update, and delete operations", async () => {
    await users.createUser({ firstName: "Ada" } as never);
    expect(apiClient.post).toHaveBeenCalledWith("/users", { firstName: "Ada" });
    await users.fetchUser("user-1");
    expect(apiClient.get).toHaveBeenCalledWith("/users/user-1");
    await users.updateUser("user-1", { firstName: "Augusta" });
    expect(apiClient.patch).toHaveBeenCalledWith("/users/user-1", {
      firstName: "Augusta",
    });
    await users.deleteUser("user-1");
    expect(apiClient.del).toHaveBeenCalledWith("/users/user-1");
  });

  it("maps option endpoints", async () => {
    await users.fetchUserRoleOptions();
    expect(apiClient.get).toHaveBeenCalledWith("/roles");
    await users.fetchUserWorkspaceOptions();
    expect(apiClient.get).toHaveBeenCalledWith("/workspaces");
  });

  it.each([
    [users.updateUserPassword, "/password", { password: "secret" }],
    [users.updateUserRoles, "/roles", { roleIds: ["role-1"] }],
    [
      users.updateUserWorkspaces,
      "/workspaces",
      { workspaceIds: ["workspace-1"] },
    ],
  ])("maps PUT subresource operation", async (operation, suffix, params) => {
    await operation("user-1", params as never);
    expect(apiClient.put).toHaveBeenCalledWith(
      `/users/user-1${suffix}`,
      params,
    );
  });

  it.each([
    [users.updateUserStatus, "/status", { status: "inactive" }],
    [users.updateUserSystemAdmin, "/system-admin", { isSystemAdmin: true }],
  ])("maps PATCH subresource operation", async (operation, suffix, params) => {
    await operation("user-1", params as never);
    expect(apiClient.patch).toHaveBeenCalledWith(
      `/users/user-1${suffix}`,
      params,
    );
  });
});
