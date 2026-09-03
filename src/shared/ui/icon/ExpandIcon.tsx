import type { FC, SVGProps } from "react";

import { SvgIcon } from "./SvgIcon";

export const ExpandIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <SvgIcon {...props}>
    <path d="M4 20h16v2H4zM4 2h16v2H4zm9 7h3l-4-4-4 4h3v6H8l4 4 4-4h-3z" />
  </SvgIcon>
);
