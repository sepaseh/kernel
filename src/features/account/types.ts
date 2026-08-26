import type { PermissionKey } from "@/features/roles";

export type Account = {
  email: null | string;
  firstName: string;
  id: string;
  isSystemAdmin: boolean;
  lastName: string;
  mobile: string;
  permissions: PermissionKey[];
  personnelCode: null | string;
  status: string;
  username: null | string;
};

export type EmailVerificationRequest = {
  email: string;
};

export type UpdateProfileRequest = {
  firstName?: string;
  lastName?: string;
  personnelCode?: string;
};

export type UpdateUsernameRequest = {
  username: string;
};

export type VerifyEmailRequest = EmailVerificationRequest & {
  otp: string;
};

export type AccountProps = Account;
export type UpdateProfileParams = UpdateProfileRequest;
export type UpdateUsernameParams = UpdateUsernameRequest;
export type VerifyEmailParams = VerifyEmailRequest;
