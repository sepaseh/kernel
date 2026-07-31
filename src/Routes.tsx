import {
  FC,
  Fragment,
  lazy,
  ReactElement,
  ReactNode,
  Suspense,
  useEffect,
} from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";

import { baseUrl, RouteKey, routeTree } from "@/config";
import { useAllowedRoutes, useCore } from "@/hooks";
import { NotFoundPage } from "@/pages/NotFound";

const AccountPage = lazy(async () => {
  const { AccountPage } = await import("@/pages/Account");
  return { default: AccountPage };
});
const AuthLayout = lazy(async () => {
  const { AuthLayout } = await import("@/layouts/Auth");
  return { default: AuthLayout };
});
const DashboardPage = lazy(async () => {
  const { DashboardPage } = await import("@/pages/Dashboard");
  return { default: DashboardPage };
});
const DefaultLayout = lazy(async () => {
  const { DefaultLayout } = await import("@/layouts/Default");
  return { default: DefaultLayout };
});
const ForgotPassPage = lazy(async () => {
  const { ForgotPassPage } = await import("@/pages/ForgotPass");
  return { default: ForgotPassPage };
});
const LoginPage = lazy(async () => {
  const { LoginPage } = await import("@/pages/Login");
  return { default: LoginPage };
});
const RegisterPage = lazy(async () => {
  const { RegisterPage } = await import("@/pages/Register");
  return { default: RegisterPage };
});
const RolesPage = lazy(async () => {
  const { RolesPage } = await import("@/pages/Roles");
  return { default: RolesPage };
});
const UsersPage = lazy(async () => {
  const { UsersPage } = await import("@/pages/Users");
  return { default: UsersPage };
});

const RouteWrapper: FC<{ route: RouteKey; children: ReactNode }> = ({
  route,
  children,
}): ReactElement => {
  const { setCurrentRoute } = useCore();
  const allowedRoutes = useAllowedRoutes();

  useEffect(() => {
    setCurrentRoute(route);
  }, [route, setCurrentRoute]);

  if (allowedRoutes.has(route)) return <Fragment>{children}</Fragment>;

  return <Navigate to={routeTree.root.path} replace />;
};

const wrapRoute = (route: RouteKey, element: ReactNode) => (
  <RouteWrapper route={route}>
    <Suspense fallback={null}>{element}</Suspense>
  </RouteWrapper>
);

const router = createBrowserRouter(
  [
    {
      path: routeTree.auth.path,
      element: (
        <Suspense fallback={null}>
          <AuthLayout />
        </Suspense>
      ),
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
      element: (
        <Suspense fallback={null}>
          <DefaultLayout />
        </Suspense>
      ),
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
