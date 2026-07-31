export type AccountProps = {
  email: null | string;
  firstName: string;
  id: string;
  isSystemAdmin: boolean;
  lastName: string;
  mobile: string;
  permissions: string[];
  personnelCode: null | string;
  status: string;
  username: null | string;
};

export type EmailVerificationParams = {
  email: string;
};

export type UpdateProfileParams = {
  firstName?: string;
  lastName?: string;
  personnelCode?: string;
};

export type UpdateUsernameParams = {
  username: string;
};

export type VerifyEmailParams = EmailVerificationParams & {
  otp: string;
};
