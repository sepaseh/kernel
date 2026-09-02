import type { FC } from "react";

import { SvgIcon } from "./SvgIcon";
import type { SvgIconProps } from "./types";

export const ExpandIcon: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M4 20h16v2H4zM4 2h16v2H4zm9 7h3l-4-4-4 4h3v6H8l4 4 4-4h-3z" />
  </SvgIcon>
);
