export type LoginParams = {
  password: string;
  username: string;
};

export type LoginProps = {
  sessionToken: string;
  userId: string;
  username: string;
};

export type PasswordParams = {
  confirmPassword?: string;
  newPassword: string;
  oldPassword: string;
};
