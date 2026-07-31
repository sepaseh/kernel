import { OtpRequestProps } from "@/features/auth/types";
import { apiClient } from "@/shared/api";

import {
  AccountProps,
  EmailVerificationParams,
  UpdateProfileParams,
  UpdateUsernameParams,
  VerifyEmailParams,
} from "./types";

export const getAccount = async (): Promise<AccountProps> => {
  return apiClient.get<AccountProps>("/account/me");
};

export const requestEmailVerification = async (
  params: EmailVerificationParams,
): Promise<OtpRequestProps> => {
  return apiClient.post<OtpRequestProps>(
    "/account/request-email-verification",
    params,
  );
};

export const updateProfile = async (
  params: UpdateProfileParams,
): Promise<AccountProps> => {
  return apiClient.patch<AccountProps>("/account/update-profile", params);
};

export const updateUsername = async (
  params: UpdateUsernameParams,
): Promise<AccountProps> => {
  return apiClient.post<AccountProps>("/account/update-username", params);
};

export const verifyEmail = async (params: VerifyEmailParams): Promise<void> => {
  return apiClient.post<void>("/account/verify-email", params);
};
