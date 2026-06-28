import {
  ActionResult,
  LoginParams,
  LoginProps,
  PasswordParams,
  UserProps,
} from "@/types";

import { apiClient } from "./instance";

export const changePassword = async (
  params: PasswordParams,
): Promise<ActionResult> => {
  return apiClient.put<ActionResult>("/api/v1/auth/password", params);
};

export const login = async (params: LoginParams): Promise<LoginProps> => {
  return apiClient.post<LoginProps>("/api/v1/auth/login", params);
};

export const me = async (): Promise<UserProps> => {
  return apiClient.get<UserProps>("/api/v1/auth/me");
};