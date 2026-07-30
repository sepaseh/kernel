import { beforeEach, describe, expect, it } from "vitest";

import { getState, setState } from "./state";

beforeEach(() => {
  localStorage.clear();
});

describe("storage state", () => {
  it("returns the initial value when the key is missing", () => {
    expect(getState("missing", { enabled: true })).toEqual({ enabled: true });
  });

  it("returns invalid JSON as its raw string value", () => {
    localStorage.setItem("invalid", "not-json");

    expect(getState("invalid", "fallback")).toBe("not-json");
  });

  it("serializes and restores values", () => {
    const value = { enabled: true, retries: 2 };

    setState("settings", value);

    expect(localStorage.getItem("settings")).toBe(JSON.stringify(value));
    expect(getState("settings", {})).toEqual(value);
  });
});
