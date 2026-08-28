import {
  Avatar,
  Button,
  Divider,
  Drawer,
  Dropdown,
  Flex,
  Grid,
  Menu,
  MenuProps,
  Spin,
  Typography,
} from "antd";
import { useAntdToken } from "antd-style";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet, useNavigate } from "react-router";

import { NavigationItem, routeTree } from "@/app/config";
import { useCore } from "@/app/hooks";
import { getAllowedNavigation } from "@/app/lib";
import { getAccount } from "@/features/account";
import { logout } from "@/features/auth";
import { clearAccessToken, setUnauthorizedHandler } from "@/shared/api";
import { Icon } from "@/shared/ui/icon";

const { useBreakpoint } = Grid;

export const DefaultLayout = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { lg } = useBreakpoint();
  const { currentRoute, setTheme, setUser, theme: coreTheme, user } = useCore();
  const token = useAntdToken();
  const navigate = useNavigate();
  const allowedNavigation = getAllowedNavigation(user);
  const darkMode = coreTheme === "dark";

  const createMenuItems = (
    items: readonly NavigationItem[],
  ): MenuProps["items"] =>
    items.map((item) => {
      if ("route" in item) {
        const { label, path } = routeTree[item.route];

        return {
          key: item.route,
          label: <Link to={path}>{t(label)}</Link>,
        };
      }

      return {
        children: createMenuItems(item.children),
        key: item.key,
        label: t(item.label),
      };
    });

  const menuItems = createMenuItems(allowedNavigation);

  const clearSession = useCallback(() => {
    clearAccessToken();
    setUser();

    navigate(routeTree.auth.path, { replace: true });
  }, [navigate, setUser]);

  const handleLogout = async () => {
    await logout().catch(() => undefined);

    clearSession();
  };

  useEffect(() => {
    void (async () => {
      try {
        const user = await getAccount();

        setUser(user);
      } catch {
        clearSession();
      }
    })();

    setUnauthorizedHandler(clearSession);

    return () => setUnauthorizedHandler(null);
  }, [clearSession, setUser]);

  if (!user) return <Spin fullscreen />;

  return (
    <>
      <header>
        <Flex
          align="center"
          gap={16}
          justify="space-between"
          style={{
            backgroundColor: token.colorBgContainer,
            height: 64,
            paddingInline: token.paddingSM,
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
                aria-label={t("menu")}
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
                  icon: <Icon name="user" />,
                  key: "1",
                  label: t("account"),
                  onClick: () =>
                    navigate(routeTree.account.path, { replace: true }),
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
                  onClick: () => void handleLogout(),
                },
              ],
            }}
            popupRender={(menu) => (
              <>
                <Flex
                  style={{
                    backgroundColor: token.colorBgContainer,
                    gap: 4,
                    minWidth: 200,
                    paddingBlock: 8,
                    paddingInline: 16,
                  }}
                  vertical
                >
                  <Typography.Text
                    style={{ alignItems: "center", display: "flex", gap: 8 }}
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
            <Button
              aria-label={t("account")}
              icon={<Avatar icon={<Icon name="user" />} />}
              type="text"
            />
          </Dropdown>
        </Flex>
      </header>
      <main
        style={{ display: "flex", flexGrow: 1, minWidth: 0, width: "100%" }}
      >
        <Outlet />
      </main>
      <Drawer
        closeIcon={false}
        onClose={() => setOpen(false)}
        open={!lg && open}
        title={false}
        styles={{ body: { padding: 8 } }}
      >
        <nav aria-label={t("menu")}>
          <Menu items={menuItems} mode="inline" selectedKeys={[currentRoute]} />
        </nav>
      </Drawer>
    </>
  );
};
