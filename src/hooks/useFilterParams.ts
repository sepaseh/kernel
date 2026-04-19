import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export const useFilterParams = <T extends Record<string, string>>() => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(Object.fromEntries(searchParams)).map(([key, value]) => [
          key,
          value ?? "",
        ])
      ) as T,
    [searchParams]
  );

  const setFilters = useCallback(
    (newFilters: Partial<T>) => {
      const sanitized = Object.fromEntries(
        Object.entries(newFilters).filter(
          ([, v]) => v !== undefined && v !== null && v !== ""
        )
      );
      setSearchParams(sanitized);
    },
    [setSearchParams]
  );

  return { filters, setFilters };
};
