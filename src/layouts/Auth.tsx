import { Flex, theme } from "antd";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { authTokenKey } from "@/config";
import { useCore } from "@/hooks";
import { delCookie } from "@/utils";

const { useToken } = theme;

export const AuthLayout = () => {
  const { setUser } = useCore();
  const { token } = useToken();

  useEffect(() => {
    delCookie(authTokenKey);

    setUser();
  }, [setUser]);

  return (
    <Flex
      style={{
        padding: token.paddingSM,
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: token.colorBgLayout,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: token.screenXS,
          padding: 32,
          borderRadius: 8,
          backgroundColor: token.colorBgBase,
        }}
      >
        <Outlet />
      </div>
    </Flex>
  );
};
