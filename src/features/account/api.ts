import type { OtpRequestProps } from "@/features/auth";
import { apiClient } from "@/shared/api";

import type {
  Account,
  EmailVerificationRequest,
  UpdateProfileRequest,
  UpdateUsernameRequest,
  VerifyEmailRequest,
} from "./types";

const basePath = "/account";

export const getAccount = async (): Promise<Account> => {
  return apiClient.get<Account>(`${basePath}/me`);
};

export const requestEmailVerification = async (
  params: EmailVerificationRequest,
): Promise<OtpRequestProps> => {
  return apiClient.post<OtpRequestProps>(
    `${basePath}/request-email-verification`,
    params,
  );
};

export const updateProfile = async (
  params: UpdateProfileRequest,
): Promise<Account> => {
  return apiClient.patch<Account>(`${basePath}/update-profile`, params);
};

export const updateUsername = async (
  params: UpdateUsernameRequest,
): Promise<Account> => {
  return apiClient.post<Account>(`${basePath}/update-username`, params);
};

export const verifyEmail = async (
  params: VerifyEmailRequest,
): Promise<void> => {
  return apiClient.post<void>(`${basePath}/verify-email`, params);
};
