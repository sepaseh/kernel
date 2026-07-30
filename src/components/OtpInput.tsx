import { Input } from "antd";
import { ComponentProps, FC } from "react";

type OtpInputProps = ComponentProps<typeof Input.OTP>;

export const OtpInput: FC<OtpInputProps> = ({
  "aria-required": ariaRequired,
  ...props
}) => {
  void ariaRequired;

  return <Input.OTP {...props} />;
};
