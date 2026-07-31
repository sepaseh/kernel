import { Input } from "antd";
import { ComponentProps, FC } from "react";

const Otp = Input.OTP;

export type OtpInputProps = ComponentProps<typeof Otp>;

export const OtpInput: FC<OtpInputProps> = (props) => {
  return <Otp {...props} />;
};
