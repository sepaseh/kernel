import type { FC, SVGProps } from "react";

import { SvgIcon } from "./SvgIcon";

export const UploadIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <SvgIcon {...props}>
    <path d="M5 20h14v-2H5zm0-10h4v6h6v-6h4l-7-7z" />
  </SvgIcon>
);
