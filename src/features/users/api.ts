import { apiClient } from "@/shared/api";
import { toSnakeCase } from "@/shared/lib";

import {
  CreateUserRequest,
  ListUsersQuery,
  UpdateUserRequest,
  User,
  UserOption,
  UserPasswordRequest,
  UserRoleRequest,
  UserStatusRequest,
  UserSummary,
  UserSystemAdminRequest,
} from "./types";

export const createUser = async (params: CreateUserRequest): Promise<User> => {
  return apiClient.post<User>("/users", params);
};

export const deleteUser = async (id: string): Promise<void> => {
  return apiClient.del<void>(`/users/${id}`);
};

export const fetchUser = async (id: string): Promise<User> => {
  return apiClient.get<User>(`/users/${id}`);
};

export const fetchUserRoleOptions = async (): Promise<UserOption[]> => {
  return apiClient.get<UserOption[]>("/roles");
};

export const fetchUsers = async (
  params: ListUsersQuery,
): Promise<{ items: UserSummary[]; total: number }> => {
  return apiClient.get<{ items: UserSummary[]; total: number }>("/users", {
    params: toSnakeCase(params),
  });
};

export const updateUser = async (
  id: string,
  params: UpdateUserRequest,
): Promise<User> => {
  return apiClient.patch<User>(`/users/${id}`, params);
};

export const updateUserPassword = async (
  id: string,
  params: UserPasswordRequest,
): Promise<void> => {
  return apiClient.put<void>(`/users/${id}/password`, params);
};

export const updateUserRoles = async (
  id: string,
  params: UserRoleRequest,
): Promise<void> => {
  return apiClient.put<void>(`/users/${id}/roles`, params);
};

export const updateUserStatus = async (
  id: string,
  params: UserStatusRequest,
): Promise<void> => {
  return apiClient.patch<void>(`/users/${id}/status`, params);
};

export const updateUserSystemAdmin = async (
  id: string,
  params: UserSystemAdminRequest,
): Promise<void> => {
  return apiClient.patch<void>(`/users/${id}/system-admin`, params);
};
