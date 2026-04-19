import { FC } from "react";
import { useTheme } from "styled-components";

import { Stack } from "./Stack";

type Placement = "center" | "left" | "right";

type DividerProps = {
  light?: boolean;
  placement?: Placement;
  text?: string;
  vertical?: boolean;
};

export const Divider: FC<DividerProps> = ({
  light,
  placement = "center",
  text,
  vertical,
}) => {
  const token = useTheme();
  const backgroundColor = light ? token.colorBorder : token.colorBorderSecondary;
  const height = vertical ? "100%" : "1px";
  const width = vertical ? "1px" : "100%";
  const flexDirection = vertical ? "column" : "row";

  return (
    <Stack
      as="span"
      $style={{
        display: "flex",
        flexDirection,
        alignItems: "center",
        gap: text ? "16px" : "0",
      }}
      $after={{
        content: placement !== "left" ? "" : "none",
        width,
        height,
        backgroundColor,
      }}
      $before={{
        content: placement !== "right" ? "" : "none",
        width,
        height,
        backgroundColor,
      }}
    >
      {!!text && (
        <Stack
          $style={{
            fontSize: "12px",
            fontWeight: "500",
            lineHeight: "16px",
            whiteSpace: "nowrap",
            transform: vertical ? "rotate(-90deg)" : "none",
          }}
        >
          {text}
        </Stack>
      )}
    </Stack>
  );
};
