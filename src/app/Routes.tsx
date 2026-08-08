import {
  FC,
  Fragment,
  lazy,
  ReactElement,
  ReactNode,
  Suspense,
  useEffect,
} from "react";
import { createBrowserRouter, Navigate, RouteObject } from "react-router";
import { RouterProvider } from "react-router/dom";

import { baseUrl, RouteKey, RouteLayout, routeTree } from "@/app/config";
import { useAllowedRoutes, useCore } from "@/app/hooks";
import { NotFoundPage } from "@/app/not-found/NotFound";

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

const pageRegistry = {
  account: <AccountPage />,
  auth: <LoginPage />,
  forgotPassword: <ForgotPassPage />,
  notFound: <NotFoundPage />,
  register: <RegisterPage />,
  roles: <RolesPage />,
  root: <DashboardPage />,
  users: <UsersPage />,
} satisfies Record<RouteKey, ReactNode>;

const routeKeys = Object.keys(routeTree) as RouteKey[];

const createPageRoute = (route: RouteKey): RouteObject => {
  const definition = routeTree[route];
  const element = wrapRoute(route, pageRegistry[route]);

  return "index" in definition && definition.index
    ? { element, index: true }
    : { element, path: definition.path };
};

const createLayoutRoutes = (layout: RouteLayout): RouteObject[] =>
  routeKeys
    .filter((route) => routeTree[route].layout === layout)
    .map(createPageRoute);

const router = createBrowserRouter(
  [
    {
      path: routeTree.auth.path,
      element: (
        <Suspense fallback={null}>
          <AuthLayout />
        </Suspense>
      ),
      children: createLayoutRoutes("auth"),
    },
    {
      path: routeTree.root.path,
      element: (
        <Suspense fallback={null}>
          <DefaultLayout />
        </Suspense>
      ),
      children: createLayoutRoutes("default"),
    },
    ...createLayoutRoutes("standalone"),
  ],
  { basename: baseUrl },
);

export const Routes = () => <RouterProvider router={router} />;
