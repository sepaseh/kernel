import { renderHook } from "@testing-library/react";
import { ContextType, PropsWithChildren } from "react";
import { describe, expect, it } from "vitest";

import { AntdContext, CoreContext, CoreContextProps } from "@/app/contexts";

import { useAntd } from "./useAntd";
import { useCore } from "./useCore";

describe("context hooks", () => {
  it("returns Ant Design context and rejects missing provider", () => {
    const value = { messageAPI: {} } as NonNullable<
      ContextType<typeof AntdContext>
    >;
    const wrapper = ({ children }: PropsWithChildren) => (
      <AntdContext.Provider value={value}>{children}</AntdContext.Provider>
    );

    expect(renderHook(() => useAntd(), { wrapper }).result.current).toBe(value);
    expect(() => renderHook(() => useAntd())).toThrow(
      "useAntd must be used within an AntdProvider",
    );
  });

  it("returns core context and rejects missing provider", () => {
    const value = { language: "en" } as CoreContextProps;
    const wrapper = ({ children }: PropsWithChildren) => (
      <CoreContext.Provider value={value}>{children}</CoreContext.Provider>
    );

    expect(renderHook(() => useCore(), { wrapper }).result.current).toBe(value);
    expect(() => renderHook(() => useCore())).toThrow(
      "useCore must be used within a CoreProvider",
    );
  });
});
