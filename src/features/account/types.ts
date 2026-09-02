import type { PermissionKey } from "@/features/roles";

export type Account = {
  email?: string;
  firstName: string;
  id: string;
  isSystemAdmin: boolean;
  lastName: string;
  mobile: string;
  permissions: PermissionKey[];
  status: string;
  username?: string;
};

export type EmailVerificationRequest = {
  email: NonNullable<Account["email"]>;
};

export type UpdateProfileRequest = Partial<
  Pick<Account, "firstName" | "lastName">
>;

export type UpdateUsernameRequest = {
  username: NonNullable<Account["username"]>;
};

export type VerifyEmailRequest = EmailVerificationRequest & {
  otp: string;
};
