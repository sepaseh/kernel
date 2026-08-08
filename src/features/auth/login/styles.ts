import { createStyles } from "antd-style";

export const loginInputStyles = {
  direction: "ltr",
  textAlign: "left",

  "&::placeholder": {
    direction: "rtl",
    textAlign: "right",
  },
} as const;

export const useLoginStyles = createStyles({
  input: loginInputStyles,
});
