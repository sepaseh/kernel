import { useCallback } from "react";
import type { NavigateOptions, To } from "react-router";
import { useLocation, useNavigate } from "react-router";

export const useGoBack = (): ((to?: To, options?: NavigateOptions) => void) => {
  const { pathname, state } = useLocation();
  const navigate = useNavigate();

  const goBack = useCallback(
    (to?: To, options?: NavigateOptions) => {
      if (state) {
        navigate(-1);
      } else if (to) {
        navigate(to, options);
      } else {
        navigate(pathname, { replace: true });
      }
    },
    [navigate, pathname, state],
  );
  return goBack;
};
