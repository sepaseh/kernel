import type { AccessTokenProps } from "@/shared/api";
import { apiClient, clearAccessToken, setAccessToken } from "@/shared/api";

import type {
  ChangePasswordParams,
  ForgotPasswordParams,
  LoginParams,
  OtpRequestParams,
  OtpRequestProps,
  RegisterParams,
} from "./types";

const basePath = "/auth";

export const changePassword = async (
  params: ChangePasswordParams,
): Promise<void> => {
  return apiClient.post<void>(`${basePath}/change-password`, params);
};

export const forgotPassword = async (
  params: ForgotPasswordParams,
): Promise<void> => {
  return apiClient.post<void>(`${basePath}/forgot-password`, params);
};

export const login = async (params: LoginParams): Promise<AccessTokenProps> => {
  const result = await apiClient.post<AccessTokenProps>(
    `${basePath}/login`,
    params,
  );
  setAccessToken(result.accessToken);
  return result;
};

export const logout = async (): Promise<void> => {
  try {
    await apiClient.post<void>(`${basePath}/logout`);
  } finally {
    clearAccessToken();
  }
};

export const register = async (
  params: RegisterParams,
): Promise<AccessTokenProps> => {
  const result = await apiClient.post<AccessTokenProps>(
    `${basePath}/register`,
    params,
  );
  setAccessToken(result.accessToken);
  return result;
};

export const requestOtp = async (
  params: OtpRequestParams,
): Promise<OtpRequestProps> => {
  return apiClient.post<OtpRequestProps>(`${basePath}/otp-request`, params);
};
