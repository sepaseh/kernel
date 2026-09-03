import type { FC, SVGProps } from "react";

import { SvgIcon } from "./SvgIcon";

export const AddIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <SvgIcon {...props}>
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
  </SvgIcon>
);
