import {
  AccountProps,
  EmailVerificationParams,
  OtpRequestProps,
  UpdateProfileParams,
  UpdateUsernameParams,
  VerifyEmailParams,
} from "@/types";

import { apiClient } from "./instance";

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
