import { describe, expect, it } from "vitest";

import { toCamelCase, toKebabCase, toSnakeCase } from "./transform";

describe("toCamelCase", () => {
  it("converts snake_case keys", () => {
    expect(toCamelCase({ first_name: "John" })).toEqual({ firstName: "John" });
  });

  it("converts kebab-case keys", () => {
    expect(toCamelCase({ "first-name": "John" })).toEqual({ firstName: "John" });
  });

  it("recursively converts nested objects", () => {
    expect(toCamelCase({ user_data: { first_name: "John" } })).toEqual({
      userData: { firstName: "John" },
    });
  });

  it("recursively converts arrays", () => {
    expect(toCamelCase([{ first_name: "John" }])).toEqual([{ firstName: "John" }]);
  });

  it("passes through primitives", () => {
    expect(toCamelCase("hello")).toBe("hello");
    expect(toCamelCase(42)).toBe(42);
    expect(toCamelCase(null)).toBe(null);
  });
});

describe("toKebabCase", () => {
  it("converts camelCase keys", () => {
    expect(toKebabCase({ firstName: "John" })).toEqual({ "first-name": "John" });
  });

  it("recursively converts nested objects", () => {
    expect(toKebabCase({ userData: { firstName: "John" } })).toEqual({
      "user-data": { "first-name": "John" },
    });
  });

  it("recursively converts arrays", () => {
    expect(toKebabCase([{ firstName: "John" }])).toEqual([{ "first-name": "John" }]);
  });

  it("passes through primitives", () => {
    expect(toKebabCase("hello")).toBe("hello");
    expect(toKebabCase(42)).toBe(42);
  });
});

describe("toSnakeCase", () => {
  it("converts camelCase keys", () => {
    expect(toSnakeCase({ firstName: "John" })).toEqual({ first_name: "John" });
  });

  it("recursively converts nested objects", () => {
    expect(toSnakeCase({ userData: { firstName: "John" } })).toEqual({
      user_data: { first_name: "John" },
    });
  });

  it("recursively converts arrays", () => {
    expect(toSnakeCase([{ firstName: "John" }])).toEqual([{ first_name: "John" }]);
  });

  it("passes through primitives", () => {
    expect(toSnakeCase("hello")).toBe("hello");
    expect(toSnakeCase(42)).toBe(42);
  });
});
