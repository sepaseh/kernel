import { apiClient } from "@/shared/api";

import { PermissionGroup, Role, RoleRequest } from "./types";

export const createRole = async (params: RoleRequest): Promise<Role> => {
  return apiClient.post<Role>("/roles", params);
};

export const deleteRole = async (id: string): Promise<void> => {
  return apiClient.del<void>(`/roles/${id}`);
};

export const fetchPermissions = async (): Promise<PermissionGroup[]> => {
  return apiClient.get<PermissionGroup[]>("/permissions");
};

export const fetchRole = async (id: string): Promise<Role> => {
  return apiClient.get<Role>(`/roles/${id}`);
};

export const fetchRoles = async (): Promise<Role[]> => {
  return apiClient.get<Role[]>("/roles");
};

export const updateRole = async (
  id: string,
  params: RoleRequest,
): Promise<Role> => {
  return apiClient.patch<Role>(`/roles/${id}`, params);
};
