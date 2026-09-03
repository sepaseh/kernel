import type { FC, SVGProps } from "react";

import { SvgIcon } from "./SvgIcon";

export const ChevronLeftIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <SvgIcon {...props}>
    <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </SvgIcon>
);
