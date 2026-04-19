import { describe, expect, it } from "vitest";

import { getState, setState } from "./state";

describe("getState", () => {
  it("returns the initial value when key is missing", () => {
    expect(getState("missing", "default")).toBe("default");
  });

  it("returns a parsed value when key exists", () => {
    localStorage.setItem("key", JSON.stringify({ a: 1 }));

    expect(getState("key", {})).toEqual({ a: 1 });
  });

  it("returns raw string when JSON parse fails", () => {
    localStorage.setItem("key", "not-json");

    expect(getState("key", "fallback")).toBe("not-json");
  });
});

describe("setState", () => {
  it("serializes and stores a value", () => {
    setState("key", { a: 1 });

    expect(localStorage.getItem("key")).toBe('{"a":1}');
  });

  it("stores a string value directly", () => {
    setState("key", "hello");

    expect(localStorage.getItem("key")).toBe('"hello"');
  });
});
