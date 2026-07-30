import { FC, ReactNode, useEffect } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";

import { baseUrl, RouteKey, routeTree } from "@/config";
import { useAllowedRoutes, useCore } from "@/hooks";
import { AuthLayout } from "@/layouts/Auth";
import { DefaultLayout } from "@/layouts/Default";
import { AccountPage } from "@/pages/Account";
import { DashboardPage } from "@/pages/Dashboard";
import { ForgotPassPage } from "@/pages/ForgotPass";
import { LoginPage } from "@/pages/Login";
import { NotFoundPage } from "@/pages/NotFound";
import { RegisterPage } from "@/pages/Register";
import { RolesPage } from "@/pages/Roles";
import { UsersPage } from "@/pages/Users";

const RouteWrapper: FC<{ route: RouteKey; children: ReactNode }> = ({
  route,
  children,
}) => {
  const { setCurrentRoute } = useCore();
  const allowedRoutes = useAllowedRoutes();

  useEffect(() => {
    setCurrentRoute(route);
  }, [route, setCurrentRoute]);

  if (allowedRoutes.has(route)) return children;

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
        {
          path: routeTree.forgotPassword.path,
          element: wrapRoute("forgotPassword", <ForgotPassPage />),
        },
        {
          path: routeTree.register.path,
          element: wrapRoute("register", <RegisterPage />),
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
          path: routeTree.account.path,
          element: wrapRoute("account", <AccountPage />),
        },
      ],
    },
    { path: routeTree.notFound.path, element: <NotFoundPage /> },
  ],
  { basename: baseUrl },
);

export const Routes = () => <RouterProvider router={router} />;
