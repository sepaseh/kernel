import { FC, ReactNode, useEffect, useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { RouteKey, routeTree } from "@/config/routes";
import { useCore } from "@/hooks/useCore";
import { DefaultLayout } from "@/layouts/Default";
import { DashboardPage } from "@/pages/Dashboard";
import { NotFoundPage } from "@/pages/NotFound";

const SetCurrentRoute: FC<{ route: RouteKey; children: ReactNode }> = ({
  route,
  children,
}) => {
  const { setCurrentRoute } = useCore();

  useEffect(() => {
    setCurrentRoute(route);
  }, [route, setCurrentRoute]);

  return children;
};

const setRoute = (route: RouteKey, element: ReactNode) => (
  <SetCurrentRoute route={route}>{element}</SetCurrentRoute>
);

export const Routes = () => {
  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          path: routeTree.root.path,
          element: <DefaultLayout />,
          children: [
            {
              index: true,
              element: setRoute("root", <DashboardPage />),
            },
          ],
        },
        { path: routeTree.notFound.path, element: <NotFoundPage /> },
      ]),
    [],
  );

  return <RouterProvider router={router} />;
};
