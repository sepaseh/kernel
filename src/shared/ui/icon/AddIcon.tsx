import type { FC } from "react";

import { SvgIcon } from "./SvgIcon";
import type { SvgIconProps } from "./types";

export const AddIcon: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
  </SvgIcon>
);
