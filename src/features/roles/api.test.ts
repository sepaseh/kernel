import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/shared/api";

import {
  createRole,
  deleteRole,
  fetchPermissions,
  fetchRole,
  fetchRoles,
  updateRole,
} from "./api";
import { RoleMutationParams } from "./types";

vi.mock("@/shared/api", () => ({
  apiClient: {
    del: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

beforeEach(() => {
  vi.mocked(apiClient.del).mockResolvedValue(undefined);
  vi.mocked(apiClient.get).mockResolvedValue([]);
  vi.mocked(apiClient.patch).mockResolvedValue({});
  vi.mocked(apiClient.post).mockResolvedValue({});
});

describe("roles API", () => {
  it("creates, updates, and deletes roles", async () => {
    const params = {
      name: "Operators",
      permissions: ["users.read"],
    } satisfies RoleMutationParams;

    await createRole(params);
    await updateRole("role-1", params);
    await deleteRole("role-1");

    expect(apiClient.post).toHaveBeenCalledWith("/roles", params);
    expect(apiClient.patch).toHaveBeenCalledWith("/roles/role-1", params);
    expect(apiClient.del).toHaveBeenCalledWith("/roles/role-1");
  });

  it("loads role collections, details, and permissions", async () => {
    await fetchRoles();
    await fetchRole("role-1");
    await fetchPermissions();

    expect(apiClient.get).toHaveBeenNthCalledWith(1, "/roles");
    expect(apiClient.get).toHaveBeenNthCalledWith(2, "/roles/role-1");
    expect(apiClient.get).toHaveBeenNthCalledWith(3, "/permissions");
  });
});
