import { ActionResult, PermissionProps, RoleParams, RoleProps } from "@/types";
import { toSnakeCase } from "@/utils";

import { apiClient } from "./instance";

export const createRole = async (params: RoleProps): Promise<ActionResult> => {
  return apiClient.post<ActionResult>("/api/v1/roles", params);
};

export const deleteRole = async (id: string): Promise<ActionResult> => {
  return apiClient.del<ActionResult>(`/api/v1/roles/${id}`);
};

export const fetchPermissions = async (): Promise<PermissionProps[]> => {
  return apiClient.get<PermissionProps[]>("/api/v1/permissions");
};

export const fetchRoles = async (
  params: RoleParams,
): Promise<{ data: RoleProps[]; total: number }> => {
  return apiClient.get<{ data: RoleProps[]; total: number }>("/api/v1/roles", {
    params: toSnakeCase(params),
  });
};

export const updateRole = async (
  id: string,
  params: RoleProps,
): Promise<ActionResult> => {
  return apiClient.put<ActionResult>(`/api/v1/roles/${id}`, params);
};