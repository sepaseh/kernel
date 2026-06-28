import { ActionResult, UserParams, UserProps, UserRoleParams } from "@/types";
import { toSnakeCase } from "@/utils";

import { apiClient } from "./instance";

export const createUser = async (params: UserProps): Promise<ActionResult> => {
  return apiClient.post<ActionResult>("/api/v1/users", params);
};

export const fetchUsers = async (
  params: UserParams,
): Promise<{ data: UserProps[]; total: number }> => {
  return apiClient.get<{ data: UserProps[]; total: number }>("/api/v1/users", {
    params: toSnakeCase(params),
  });
};

export const updateUser = async (
  id: string,
  params: UserProps,
): Promise<ActionResult> => {
  return apiClient.patch<ActionResult>(`/api/v1/users/${id}`, params);
};

export const updateUserRoles = async (
  id: string,
  params: UserRoleParams,
): Promise<ActionResult> => {
  return apiClient.put<ActionResult>(`/api/v1/users/${id}/roles`, params);
};

export const updateUserPassword = async (
  id: string,
  newPassword: string,
): Promise<ActionResult> => {
  return apiClient.put<ActionResult>(`/api/v1/users/${id}/password`, {
    newPassword,
  });
};

export const updateUserStatus = async (
  id: string,
  isActive: boolean,
): Promise<ActionResult> => {
  return apiClient.put<ActionResult>(`/api/v1/users/${id}/status`, {
    isActive,
  });
};