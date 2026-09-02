import type { FC } from "react";

import { SvgIcon } from "./SvgIcon";
import type { SvgIconProps } from "./types";

export const MenuIcon: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z" />
  </SvgIcon>
);
