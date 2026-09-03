import type { FC, SVGProps } from "react";

import { SvgIcon } from "./SvgIcon";

export const CompactIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <SvgIcon {...props}>
    <path d="M8 19h3v3h2v-3h3l-4-4zm8-15h-3V1h-2v3H8l4 4zM4 9v2h16V9zm0 3h16v2H4z" />
  </SvgIcon>
);
