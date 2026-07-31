export type ChangePasswordParams = {
  currentPassword: string;
  newPassword: string;
};

export type ForgotPasswordParams = {
  mobile: string;
  otp: string;
  password: string;
};

export type LoginParams = {
  identifier: string;
  password: string;
};

export type OtpRequestParams = {
  mobile: string;
  purpose: "forgot_password" | "login" | "register" | "verify_email";
};

export type OtpRequestProps = {
  expiresIn: number;
  remainingSeconds: number;
};

export type RegisterParams = {
  firstName: string;
  lastName: string;
  mobile: string;
  otp: string;
  password: string;
};
