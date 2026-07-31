import { Input, InputProps } from "antd";
import { FC } from "react";

export type DigitsInputProps = InputProps;

export const DigitsInput: FC<DigitsInputProps> = ({ onChange, ...rest }) => (
  <Input
    onChange={(e) => {
      if (onChange) {
        onChange({
          ...e,
          ...{
            target: { ...e.target, value: e.target.value?.replace(/\D/g, "") },
          },
        });
      }
    }}
    {...rest}
  />
);
