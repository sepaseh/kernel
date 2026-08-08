import { useAntdToken } from "antd-style";
import { useEffect } from "react";
import { Outlet } from "react-router";

import { useCore } from "@/app/hooks";
import { clearAccessToken } from "@/shared/api";

export const AuthLayout = () => {
  const { setUser } = useCore();
  const token = useAntdToken();

  useEffect(() => {
    clearAccessToken();
    setUser();
  }, [setUser]);

  return (
    <main
      style={{
        alignItems: "center",
        backgroundColor: token.colorBgLayout,
        display: "flex",
        flexGrow: 1,
        justifyContent: "center",
        padding: token.paddingSM,
      }}
    >
      <div
        style={{
          backgroundColor: token.colorBgContainer,
          borderRadius: 8,
          maxWidth: token.screenXS,
          padding: 32,
          width: "100%",
        }}
      >
        <Outlet />
      </div>
    </main>
  );
};
