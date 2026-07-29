import { PermissionGroupProps, RoleMutationParams, RoleProps } from "@/types";

import { apiClient } from "./instance";

export const createRole = async (
  params: RoleMutationParams,
): Promise<RoleProps> => {
  return apiClient.post<RoleProps>("/roles", params);
};

export const deleteRole = async (id: string): Promise<void> => {
  return apiClient.del<void>(`/roles/${id}`);
};

export const fetchPermissions = async (): Promise<PermissionGroupProps[]> => {
  return apiClient.get<PermissionGroupProps[]>("/permissions");
};

export const fetchRole = async (id: string): Promise<RoleProps> => {
  return apiClient.get<RoleProps>(`/roles/${id}`);
};

export const fetchRoles = async (): Promise<RoleProps[]> => {
  return apiClient.get<RoleProps[]>("/roles");
};

export const updateRole = async (
  id: string,
  params: RoleMutationParams,
): Promise<RoleProps> => {
  return apiClient.patch<RoleProps>(`/roles/${id}`, params);
};
