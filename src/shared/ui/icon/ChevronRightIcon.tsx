import type { FC, SVGProps } from "react";

import { SvgIcon } from "./SvgIcon";

export const ChevronRightIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <SvgIcon {...props}>
    <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
  </SvgIcon>
);
