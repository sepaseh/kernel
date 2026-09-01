import { Input } from "antd";
import type { ComponentProps, FC } from "react";

const Otp = Input.OTP;

type OtpInputProps = ComponentProps<typeof Otp>;

export const OtpInput: FC<OtpInputProps> = (props) => {
  return <Otp {...props} aria-required={undefined} />;
};
