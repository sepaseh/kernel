import {
  AccessTokenProps,
  ChangePasswordParams,
  ForgotPasswordParams,
  LoginParams,
  OtpRequestParams,
  OtpRequestProps,
  RegisterParams,
} from "@/types";

import { apiClient } from "./instance";
import { clearAccessToken, setAccessToken } from "./token";

export const changePassword = async (
  params: ChangePasswordParams,
): Promise<void> => {
  return apiClient.post<void>("/auth/change-password", params);
};

export const forgotPassword = async (
  params: ForgotPasswordParams,
): Promise<void> => {
  return apiClient.post<void>("/auth/forgot-password", params);
};

export const login = async (params: LoginParams): Promise<AccessTokenProps> => {
  const result = await apiClient.post<AccessTokenProps>("/auth/login", params);

  setAccessToken(result.accessToken);

  return result;
};

export const logout = async (): Promise<void> => {
  try {
    await apiClient.post<void>("/auth/logout");
  } finally {
    clearAccessToken();
  }
};

export const register = async (
  params: RegisterParams,
): Promise<AccessTokenProps> => {
  const result = await apiClient.post<AccessTokenProps>(
    "/auth/register",
    params,
  );

  setAccessToken(result.accessToken);

  return result;
};

export const requestOtp = async (
  params: OtpRequestParams,
): Promise<OtpRequestProps> => {
  return apiClient.post<OtpRequestProps>("/auth/otp-request", params);
};
