import type { FC, SVGProps } from "react";

export const SvgIcon: FC<SVGProps<SVGSVGElement>> = ({
  children,
  ...props
}) => (
  <svg
    fill="currentColor"
    height="1em"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
    aria-hidden
  >
    {children}
  </svg>
);
