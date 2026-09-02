import type { FC } from "react";

import { AddIcon } from "./AddIcon";
import { BoltIcon } from "./BoltIcon";
import { CheckIcon } from "./CheckIcon";
import { ChevronLeftIcon } from "./ChevronLeftIcon";
import { ChevronRightIcon } from "./ChevronRightIcon";
import { CloseIcon } from "./CloseIcon";
import { CompactIcon } from "./CompactIcon";
import { DarkModeIcon } from "./DarkModeIcon";
import { DeleteIcon } from "./DeleteIcon";
import { EditIcon } from "./EditIcon";
import { ExpandIcon } from "./ExpandIcon";
import { HomeIcon } from "./HomeIcon";
import { KeyIcon } from "./KeyIcon";
import { LightModeIcon } from "./LightModeIcon";
import { LockIcon } from "./LockIcon";
import { LogoutIcon } from "./LogoutIcon";
import { MenuIcon } from "./MenuIcon";
import { PersonIcon } from "./PersonIcon";
import type { SvgIconProps } from "./types";
import { UploadIcon } from "./UploadIcon";

const iconMap = {
  add: AddIcon,
  bolt: BoltIcon,
  check: CheckIcon,
  chevronLeft: ChevronLeftIcon,
  chevronRight: ChevronRightIcon,
  close: CloseIcon,
  compact: CompactIcon,
  delete: DeleteIcon,
  edit: EditIcon,
  expand: ExpandIcon,
  home: HomeIcon,
  key: KeyIcon,
  lightMode: LightModeIcon,
  lock: LockIcon,
  logout: LogoutIcon,
  menu: MenuIcon,
  moon: DarkModeIcon,
  user: PersonIcon,
  upload: UploadIcon,
} as const;

type IconName = keyof typeof iconMap;

type IconProps = Omit<SvgIconProps, "children"> & {
  name: IconName;
  size?: number;
};

export const Icon: FC<IconProps> = ({ name, size = 16, style, ...props }) => {
  const MappedIcon = iconMap[name];

  return (
    <MappedIcon
      {...props}
      aria-hidden
      fontSize="inherit"
      style={{ ...style, fontSize: size }}
    />
  );
};
