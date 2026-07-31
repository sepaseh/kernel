import { Input } from "antd";
import { ComponentProps, FC } from "react";

type OtpInputProps = ComponentProps<typeof Input.OTP>;

export const OtpInput: FC<OtpInputProps> = (props) => {
  const otpProps = { ...props };

  delete otpProps["aria-required"];

  return <Input.OTP {...otpProps} />;
};
