import type { FC, ReactNode } from "react";
import { Fragment, lazy, Suspense, useEffect } from "react";
import type { RouteObject } from "react-router";
import { createBrowserRouter, Navigate, useRouteError } from "react-router";
import { RouterProvider } from "react-router/dom";

import type { RouteKey, RouteLayout } from "@/app/config";
import { baseUrl, routeTree } from "@/app/config";
import { useCore } from "@/app/hooks";
import { hasRouteAccess } from "@/app/lib";
import { NotFoundPage } from "@/app/not-found/NotFound";
import { reportError } from "@/shared/lib";
import { ErrorFallback } from "@/shared/ui/error-boundary";
import { RouteLoading } from "@/shared/ui/route-loading";

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

type RouteWrapperProps = {
  children: ReactNode;
  route: RouteKey;
};

const RouteWrapper: FC<RouteWrapperProps> = ({ route, children }) => {
  const { setCurrentRoute, user } = useCore();

  useEffect(() => {
    setCurrentRoute(route);
  }, [route, setCurrentRoute]);

  if (hasRouteAccess(route, user)) return <Fragment>{children}</Fragment>;

  return <Navigate to={routeTree.root.path} replace />;
};

const wrapRoute = (route: RouteKey, element: ReactNode) => (
  <RouteWrapper route={route}>
    <Suspense fallback={<RouteLoading />}>{element}</Suspense>
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

const RouteErrorBoundary = () => {
  const error = useRouteError();

  useEffect(() => {
    reportError(error, { source: "react-router.error-boundary" });
  }, [error]);

  return <ErrorFallback />;
};

const router = createBrowserRouter(
  [
    {
      children: [
        {
          path: routeTree.auth.path,
          element: (
            <Suspense fallback={<RouteLoading />}>
              <AuthLayout />
            </Suspense>
          ),
          children: createLayoutRoutes("auth"),
        },
        {
          path: routeTree.root.path,
          element: (
            <Suspense fallback={<RouteLoading />}>
              <DefaultLayout />
            </Suspense>
          ),
          children: createLayoutRoutes("default"),
        },
        ...createLayoutRoutes("standalone"),
      ],
      errorElement: <RouteErrorBoundary />,
    },
  ],
  { basename: baseUrl },
);

export const Routes = () => <RouterProvider router={router} />;
