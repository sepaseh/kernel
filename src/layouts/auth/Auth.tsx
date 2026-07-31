import { useAntdToken } from "antd-style";
import { useEffect } from "react";
import { Outlet } from "react-router";

import { clearAccessToken } from "@/api/token";
import { useCore } from "@/hooks";

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
        display: "flex",
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
    </main>
  );
};
