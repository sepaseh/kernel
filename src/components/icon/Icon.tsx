import { FC } from "react";

const iconMap = {
  add: "➕",
  bolt: "⚡",
  delete: "🗑️",
  edit: "✎",
  home: "⌂",
  key: "🔑",
  lightMode: "☀️",
  lock: "🔒",
  logout: "🚪",
  menu: "☰",
  moon: "🌙",
  user: "👤",
} as const;

type IconName = keyof typeof iconMap;

type IconProps = {
  name: IconName;
  size?: number;
};

export const Icon: FC<IconProps> = ({ name, size = 16 }) => (
  <span style={{ fontSize: size, lineHeight: 1 }} aria-hidden>
    {iconMap[name]}
  </span>
);
