import type { FC } from "react";

import { SvgIcon } from "./SvgIcon";
import type { SvgIconProps } from "./types";

export const UploadIcon: FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M5 20h14v-2H5zm0-10h4v6h6v-6h4l-7-7z" />
  </SvgIcon>
);
