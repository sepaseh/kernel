import { apiClient } from "@/shared/api";
import { toSnakeCase } from "@/shared/lib";

import type {
  User,
  UserListQuery,
  UserPasswordRequest,
  UserRequest,
  UserRoleRequest,
  UserStatusRequest,
  UserSystemAdminRequest,
} from "./types";

const basePath = "/users";

export const createUser = async (
  params: UserRequest & UserPasswordRequest,
): Promise<User> => {
  return apiClient.post<User>(basePath, params);
};

export const deleteUser = async (id: User["id"]): Promise<void> => {
  return apiClient.del<void>(`${basePath}/${id}`);
};

export const fetchUser = async (id: User["id"]): Promise<User> => {
  return apiClient.get<User>(`${basePath}/${id}`);
};

export const fetchUsers = async (
  params: UserListQuery,
): Promise<{ items: User[]; total: number }> => {
  return apiClient.get<{ items: User[]; total: number }>(basePath, {
    params: toSnakeCase(params),
  });
};

export const updateUser = async (
  id: User["id"],
  params: UserRequest,
): Promise<User> => {
  return apiClient.patch<User>(`${basePath}/${id}`, params);
};

export const updateUserPassword = async (
  id: User["id"],
  params: UserPasswordRequest,
): Promise<void> => {
  return apiClient.put<void>(`${basePath}/${id}/password`, params);
};

export const updateUserRoles = async (
  id: User["id"],
  params: UserRoleRequest,
): Promise<void> => {
  return apiClient.put<void>(`${basePath}/${id}/roles`, params);
};

export const updateUserStatus = async (
  id: User["id"],
  params: UserStatusRequest,
): Promise<void> => {
  return apiClient.patch<void>(`${basePath}/${id}/status`, params);
};

export const updateUserSystemAdmin = async (
  id: User["id"],
  params: UserSystemAdminRequest,
): Promise<void> => {
  return apiClient.patch<void>(`${basePath}/${id}/system-admin`, params);
};
