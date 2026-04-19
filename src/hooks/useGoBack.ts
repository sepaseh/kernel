import { useCallback } from "react";
import {
  NavigateOptions,
  To,
  useLocation,
  useNavigate,
} from "react-router-dom";

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
    [navigate, pathname, state]
  );

  return goBack;
};
