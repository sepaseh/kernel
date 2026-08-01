import { ConfigProvider, theme } from "antd";
import { type ReactNode, useEffect } from "react";

type PreviewFrameProps = {
  children: ReactNode;
  direction: "ltr" | "rtl";
  themeMode: "dark" | "light";
};

export const PreviewFrame = ({
  children,
  direction,
  themeMode,
}: PreviewFrameProps) => {
  useEffect(() => {
    document.documentElement.dir = direction;
  }, [direction]);

  return (
    <ConfigProvider
      direction={direction}
      theme={{
        algorithm:
          themeMode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { fontFamily: "inherit" },
      }}
    >
      <div dir={direction}>{children}</div>
    </ConfigProvider>
  );
};
