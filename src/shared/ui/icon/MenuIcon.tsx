import type { FC, SVGProps } from "react";

import { SvgIcon } from "./SvgIcon";

export const MenuIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <SvgIcon {...props}>
    <path d="M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z" />
  </SvgIcon>
);
