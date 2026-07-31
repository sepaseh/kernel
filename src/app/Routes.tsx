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

import { useAllowedRoutes, useCore } from "@/app/hooks";
import { NotFoundPage } from "@/app/not-found";
import { baseUrl, RouteKey, routeTree } from "@/config";

const AccountPage = lazy(async () => {
  const { AccountPage } = await import("@/features/account");
  return { default: AccountPage };
});
const AuthLayout = lazy(async () => {
  const { AuthLayout } = await import("@/layouts/auth");
  return { default: AuthLayout };
});
const DashboardPage = lazy(async () => {
  const { DashboardPage } = await import("@/features/dashboard");
  return { default: DashboardPage };
});
const DefaultLayout = lazy(async () => {
  const { DefaultLayout } = await import("@/layouts/default");
  return { default: DefaultLayout };
});
const ForgotPassPage = lazy(async () => {
  const { ForgotPassPage } = await import("@/features/auth/forgot-pass");
  return { default: ForgotPassPage };
});
const LoginPage = lazy(async () => {
  const { LoginPage } = await import("@/features/auth/login");
  return { default: LoginPage };
});
const RegisterPage = lazy(async () => {
  const { RegisterPage } = await import("@/features/auth/register");
  return { default: RegisterPage };
});
const RolesPage = lazy(async () => {
  const { RolesPage } = await import("@/features/roles");
  return { default: RolesPage };
});
const UsersPage = lazy(async () => {
  const { UsersPage } = await import("@/features/users");
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
