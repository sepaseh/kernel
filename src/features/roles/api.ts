import { apiClient } from "@/shared/api";

import type { PermissionGroup, Role, RoleRequest } from "./types";

const basePath = "/roles";

export const createRole = async (params: RoleRequest): Promise<Role> => {
  return apiClient.post<Role>(basePath, params);
};

export const deleteRole = async (id: Role["id"]): Promise<void> => {
  return apiClient.del<void>(`${basePath}/${id}`);
};

export const fetchPermissions = async (): Promise<PermissionGroup[]> => {
  return apiClient.get<PermissionGroup[]>(`${basePath}/permissions`);
};

export const fetchRole = async (id: Role["id"]): Promise<Role> => {
  return apiClient.get<Role>(`${basePath}/${id}`);
};

export const fetchRoles = async (): Promise<Role[]> => {
  return apiClient.get<Role[]>(basePath);
};

export const updateRole = async (
  id: Role["id"],
  params: RoleRequest,
): Promise<Role> => {
  return apiClient.patch<Role>(`${basePath}/${id}`, params);
};
