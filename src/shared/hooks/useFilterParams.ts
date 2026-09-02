import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

export const useFilterParams = <T extends Record<string, string>>() => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(Object.fromEntries(searchParams)).map(([key, value]) => [
          key,
          value ?? "",
        ]),
      ) as T,
    [searchParams],
  );

  const setFilters = useCallback(
    (newFilters: Partial<T>) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        for (const [key, value] of Object.entries(newFilters)) {
          if (value === undefined || value === null || value === "") {
            next.delete(key);
          } else {
            next.set(key, value);
          }
        }
        return next;
      });
    },
    [setSearchParams],
  );
  return { filters, setFilters };
};
