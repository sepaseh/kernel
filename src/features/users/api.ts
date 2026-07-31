import { apiClient } from "@/shared/api";
import { toSnakeCase } from "@/shared/lib";

import {
  CreateUserParams,
  UpdateUserParams,
  UserListParams,
  UserOptionProps,
  UserPasswordParams,
  UserProps,
  UserRoleParams,
  UserStatusParams,
  UserSummaryProps,
  UserSystemAdminParams,
  UserWorkspaceParams,
} from "./types";

export const createUser = async (
  params: CreateUserParams,
): Promise<UserProps> => {
  return apiClient.post<UserProps>("/users", params);
};

export const deleteUser = async (id: string): Promise<void> => {
  return apiClient.del<void>(`/users/${id}`);
};

export const fetchUser = async (id: string): Promise<UserProps> => {
  return apiClient.get<UserProps>(`/users/${id}`);
};

export const fetchUserRoleOptions = async (): Promise<UserOptionProps[]> => {
  return apiClient.get<UserOptionProps[]>("/roles");
};

export const fetchUsers = async (
  params: UserListParams,
): Promise<{ items: UserSummaryProps[]; total: number }> => {
  return apiClient.get<{ items: UserSummaryProps[]; total: number }>("/users", {
    params: toSnakeCase(params),
  });
};

export const fetchUserWorkspaceOptions = async (): Promise<
  UserOptionProps[]
> => {
  return apiClient.get<UserOptionProps[]>("/workspaces");
};

export const updateUser = async (
  id: string,
  params: UpdateUserParams,
): Promise<UserProps> => {
  return apiClient.patch<UserProps>(`/users/${id}`, params);
};

export const updateUserPassword = async (
  id: string,
  params: UserPasswordParams,
): Promise<void> => {
  return apiClient.put<void>(`/users/${id}/password`, params);
};

export const updateUserRoles = async (
  id: string,
  params: UserRoleParams,
): Promise<void> => {
  return apiClient.put<void>(`/users/${id}/roles`, params);
};

export const updateUserStatus = async (
  id: string,
  params: UserStatusParams,
): Promise<void> => {
  return apiClient.patch<void>(`/users/${id}/status`, params);
};

export const updateUserSystemAdmin = async (
  id: string,
  params: UserSystemAdminParams,
): Promise<void> => {
  return apiClient.patch<void>(`/users/${id}/system-admin`, params);
};

export const updateUserWorkspaces = async (
  id: string,
  params: UserWorkspaceParams,
): Promise<void> => {
  return apiClient.put<void>(`/users/${id}/workspaces`, params);
};
