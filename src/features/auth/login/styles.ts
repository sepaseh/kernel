import { createStyles } from "antd-style";

export const useLoginStyles = createStyles({
  input: {
    direction: "ltr",
    textAlign: "left",

    "&::placeholder": {
      direction: "rtl",
      textAlign: "right",
    },
  },
});
