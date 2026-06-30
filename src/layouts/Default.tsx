import {
  Avatar,
  Button,
  Divider,
  Drawer,
  Dropdown,
  Flex,
  Grid,
  Menu,
  Spin,
  theme,
  Typography,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet, useNavigate } from "react-router-dom";

import { me, setUnauthorizedHandler } from "@/api";
import { Icon } from "@/components/Icon";
import { authTokenKey, RouteKey, routeTree } from "@/config";
import { useAllowedRoutes, useCore } from "@/hooks";
import { delCookie, getCookie } from "@/utils";

const { useBreakpoint } = Grid;
const { useToken } = theme;

export const DefaultLayout = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { lg } = useBreakpoint();
  const { currentRoute, setTheme, setUser, theme: coreTheme, user } = useCore();
  const { token } = useToken();
  const navigate = useNavigate();
  const allowedRoutes = useAllowedRoutes();
  const darkMode = coreTheme === "dark";

  const menuItemLabels: Partial<Record<RouteKey, string>> = {
    root: t("dashboard"),
    users: t("users"),
    roles: t("roles"),
  };

  const menuItems = (Object.entries(menuItemLabels) as [RouteKey, string][])
    .filter(([key]) => allowedRoutes.has(key))
    .map(([key, label]) => ({
      key,
      label: <Link to={routeTree[key].path}>{label}</Link>,
    }));

  const handleLogout = useCallback(() => {
    delCookie(authTokenKey);

    setUser();

    navigate(routeTree.auth.path, { replace: true });
  }, [navigate, setUser]);

  useEffect(() => {
    void (async () => {
      try {
        const authToken = getCookie(authTokenKey);

        if (!authToken) throw new Error();

        const user = await me();

        setUser(user);
      } catch {
        handleLogout();
      }
    })();

    setUnauthorizedHandler(handleLogout);
  }, [handleLogout, setUser]);

  if (!user) return <Spin fullscreen />;

  return (
    <>
      <Flex
        align="center"
        gap={16}
        justify="space-between"
        style={{
          height: 64,
          paddingInline: token.paddingSM,
          backgroundColor: token.colorBgContainer,
        }}
      >
        <Link to={routeTree.root.path}>
          <Typography.Text strong style={{ color: token.colorTextBase }}>
            kernel
          </Typography.Text>
        </Link>
        {lg ? (
          <Menu
            builtinPlacements={{ bottomLeft: { points: ["tr", "br"] } }}
            items={menuItems}
            mode="horizontal"
            selectedKeys={[currentRoute]}
            style={{ flexGrow: 1, lineHeight: "64px" }}
          />
        ) : (
          <Flex style={{ flexGrow: 1 }}>
            <Button
              icon={<Icon name="menu" />}
              onClick={() => setOpen(true)}
              type="text"
            />
          </Flex>
        )}
        <Dropdown
          menu={{
            items: [
              {
                icon: <Icon name="lock" />,
                key: "1",
                label: t("changePassword"),
                onClick: () =>
                  navigate(routeTree.password.path, { replace: true }),
              },
              {
                icon: <Icon name={darkMode ? "lightMode" : "moon"} />,
                key: "2",
                label: t(darkMode ? "lightMode" : "darkMode"),
                onClick: () => setTheme(darkMode ? "light" : "dark"),
              },
              {
                danger: true,
                icon: <Icon name="logout" />,
                key: "3",
                label: t("logout"),
                onClick: handleLogout,
              },
            ],
          }}
          popupRender={(menu) => (
            <>
              <Flex
                style={{
                  minWidth: 200,
                  paddingBlock: 8,
                  paddingInline: 16,
                  gap: 4,
                  backgroundColor: token.colorBgContainer,
                }}
                vertical
              >
                <Typography.Text
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <Icon name="user" size={14} />
                  {`${user.firstName} ${user.lastName}`.trim()}
                </Typography.Text>
              </Flex>
              <Divider variant="dashed" />
              {menu}
            </>
          )}
        >
          <Avatar icon={<Icon name="user" />} style={{ cursor: "pointer" }} />
        </Dropdown>
      </Flex>
      <Outlet />
      <Drawer
        closeIcon={false}
        onClose={() => setOpen(false)}
        open={!lg && open}
        title={false}
        styles={{ body: { padding: 8 } }}
      >
        <Menu items={menuItems} mode="inline" selectedKeys={[currentRoute]} />
      </Drawer>
    </>
  );
};
