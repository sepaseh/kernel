import { FC, ReactNode, useEffect } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import { baseUrl, RouteKey, routeTree } from "@/config";
import { useCore, usePermissions } from "@/hooks";
import { AuthLayout } from "@/layouts/Auth";
import { DefaultLayout } from "@/layouts/Default";
import { DashboardPage } from "@/pages/Dashboard";
import { LoginPage } from "@/pages/Login";
import { NotFoundPage } from "@/pages/NotFound";
import { PasswordPage } from "@/pages/Password";
import { RolesPage } from "@/pages/Roles";
import { UsersPage } from "@/pages/Users";

const RouteWrapper: FC<{ route: RouteKey; children: ReactNode }> = ({
  route,
  children,
}) => {
  const { setCurrentRoute } = useCore();
  const permissions = usePermissions();

  useEffect(() => {
    setCurrentRoute(route);
  }, [route, setCurrentRoute]);

  if (permissions.has(route)) return children;

  return <Navigate to={routeTree.root.path} replace />;
};

const wrapRoute = (route: RouteKey, element: ReactNode) => (
  <RouteWrapper route={route}>{element}</RouteWrapper>
);

const router = createBrowserRouter(
  [
    {
      path: routeTree.auth.path,
      element: <AuthLayout />,
      children: [
        {
          index: true,
          element: wrapRoute("auth", <LoginPage />),
        },
      ],
    },
    {
      path: routeTree.root.path,
      element: <DefaultLayout />,
      children: [
        {
          index: true,
          element: wrapRoute("root", <DashboardPage />),
        },
        {
          path: routeTree.users.path,
          element: wrapRoute("users", <UsersPage />),
        },
        {
          path: routeTree.roles.path,
          element: wrapRoute("roles", <RolesPage />),
        },
        {
          path: routeTree.password.path,
          element: wrapRoute("password", <PasswordPage />),
        },
      ],
    },
    { path: routeTree.notFound.path, element: <NotFoundPage /> },
  ],
  { basename: baseUrl },
);

export const Routes = () => <RouterProvider router={router} />;