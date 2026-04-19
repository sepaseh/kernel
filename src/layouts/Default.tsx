import { Outlet } from "react-router-dom";
import { useTheme } from "styled-components";

import { HStack, VStack } from "@/ui/Stack";

export const DefaultLayout = () => {
  const token = useTheme();

  return (
    <VStack $style={{ minHeight: "100vh" }}>
      <HStack
        $style={{
          position: "sticky",
          top: "0",
          zIndex: "2",
          height: "72px",
          alignItems: "center",
          justifyContent: "center",
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: token.colorBorder,
          backgroundColor: token.colorBgContainer,
        }}
      >
        {/* Header / Nav */}
      </HStack>
      <VStack $style={{ flexGrow: "1", alignItems: "center" }}>
        <Outlet />
      </VStack>
    </VStack>
  );
};
