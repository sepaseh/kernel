import { Outlet } from "react-router-dom";
import { useTheme } from "styled-components";

import { HStack, VStack } from "@/ui/Stack";

export const AuthLayout = () => {
  const token = useTheme();

  return (
    <HStack
      $style={{
        overflow: "hidden",
        minHeight: "100vh",
        flexGrow: "1",
        backgroundImage: `linear-gradient(314deg, ${token.colorBgContainer} 64%, ${token.colorBgElevated} 154%)`,
      }}
    >
      <VStack
        $style={{
          minWidth: "480px",
          padding: "32px",
          flexGrow: "1",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Outlet />
      </VStack>
    </HStack>
  );
};
