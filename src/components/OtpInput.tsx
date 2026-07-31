import { Input } from "antd";
import { ComponentProps, FC } from "react";

type OtpInputProps = ComponentProps<typeof Input.OTP>;

export const OtpInput: FC<OtpInputProps> = (props) => {
  return <Input.OTP {...props} />;
};
