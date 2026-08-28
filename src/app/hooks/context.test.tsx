import { renderHook } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { describe, expect, it } from "vitest";

import { CoreContext, CoreContextValue } from "@/app/contexts";

import { useCore } from "./useCore";

describe("context hooks", () => {
  it("returns core context and rejects missing provider", () => {
    const value = { language: "en" } as CoreContextValue;
    const wrapper = ({ children }: PropsWithChildren) => (
      <CoreContext.Provider value={value}>{children}</CoreContext.Provider>
    );

    expect(renderHook(() => useCore(), { wrapper }).result.current).toBe(value);
    expect(() => renderHook(() => useCore())).toThrow(
      "useCore must be used within a CoreProvider",
    );
  });
});
