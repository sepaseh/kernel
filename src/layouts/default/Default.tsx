import type { MenuProps } from "antd";
import {
  Avatar,
  Breadcrumb,
  Button,
  Drawer,
  Dropdown,
  Flex,
  Grid,
  Menu,
  Spin,
  Tooltip,
} from "antd";
import { useAntdToken } from "antd-style";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet, useNavigate } from "react-router";

import type { NavigationItem } from "@/app/config";
import { routeTree } from "@/app/config";
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
  const {
    compact,
    currentRoute,
    logos,
    setCompact,
    setTheme,
    setUser,
    theme: coreTheme,
    user,
  } = useCore();
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

  const findBreadcrumbItems = (
    items: readonly NavigationItem[],
  ): { title: string }[] | undefined => {
    for (const item of items) {
      if ("route" in item) {
        if (item.route === currentRoute) {
          return [{ title: t(routeTree[item.route].label) }];
        }

        continue;
      }

      const children = findBreadcrumbItems(item.children);
      if (children) return [{ title: t(item.label) }, ...children];
    }
  };

  const currentRouteConfig = routeTree[currentRoute];
  const currentBreadcrumbItems =
    findBreadcrumbItems(allowedNavigation) ??
    ("label" in currentRouteConfig
      ? [{ title: t(currentRouteConfig.label) }]
      : []);
  const breadcrumbItems =
    currentRoute === "root"
      ? currentBreadcrumbItems
      : [
          {
            title: (
              <Link to={routeTree.root.path}>{t(routeTree.root.label)}</Link>
            ),
          },
          ...currentBreadcrumbItems,
        ];

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

  const userName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <>
      <header style={{ backgroundColor: token.colorBgContainer }}>
        <Flex
          align="center"
          gap={16}
          justify="space-between"
          style={{
            height: 64,
            marginInline: "auto",
            maxWidth: token.screenXXXL,
            paddingInline: token.paddingSM,
          }}
        >
          <Link aria-label={t("logo")} to={routeTree.root.path}>
            {logos?.[coreTheme] ? (
              <img
                alt={t("logo")}
                src={logos[coreTheme]}
                style={{ display: "block", height: 28, width: "auto" }}
              />
            ) : null}
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
                  icon: <Icon name={compact ? "expand" : "compact"} />,
                  key: "3",
                  label: t(compact ? "normalMode" : "compactMode"),
                  onClick: () => setCompact(!compact),
                },
                {
                  danger: true,
                  icon: <Icon name="logout" />,
                  key: "4",
                  label: t("logout"),
                  onClick: () => void handleLogout(),
                },
              ],
            }}
          >
            <Tooltip placement="right" title={userName}>
              <Button
                aria-label={t("account")}
                icon={<Avatar icon={<Icon name="user" />} />}
                type="text"
              />
            </Tooltip>
          </Dropdown>
        </Flex>
      </header>
      <main
        style={{
          backgroundColor: token.colorBgLayout,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          marginInline: "auto",
          maxWidth: token.screenXXXL,
          minWidth: 0,
          paddingBlock: token.paddingMD,
          paddingInline: token.paddingSM,
          width: "100%",
        }}
      >
        <h1
          style={{
            clip: "rect(0 0 0 0)",
            clipPath: "inset(50%)",
            height: 1,
            overflow: "hidden",
            position: "absolute",
            whiteSpace: "nowrap",
            width: 1,
          }}
        >
          {currentBreadcrumbItems.at(-1)?.title}
        </h1>
        <Breadcrumb
          aria-label={t("breadcrumb")}
          items={breadcrumbItems}
          style={{ marginBottom: token.marginMD }}
        />
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
