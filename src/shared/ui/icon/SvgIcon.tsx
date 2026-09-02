import type { FC } from "react";

import type { SvgIconProps } from "./types";

export const SvgIcon: FC<SvgIconProps> = ({ children, ...props }) => (
  <svg
    fill="currentColor"
    height="1em"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    {children}
  </svg>
);
