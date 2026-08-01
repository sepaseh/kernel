import { describe, expect, it } from "vitest";

import { toCamelCase, toSnakeCase } from "./transform";

describe("case transforms", () => {
  it("converts nested API responses to camel case", () => {
    const callback = () => undefined;

    expect(
      toCamelCase({
        "display-name": "Ada",
        first_name: "Ada",
        onComplete: callback,
        role_ids: ["role-1"],
        profile: { created_at: 1 },
      }),
    ).toEqual({
      displayName: "Ada",
      firstName: "Ada",
      onComplete: callback,
      roleIds: ["role-1"],
      profile: { createdAt: 1 },
    });
  });

  it("converts nested request bodies to snake case", () => {
    expect(
      toSnakeCase({
        firstName: "Ada",
        roles: [{ roleId: "role-1" }],
        profile: { createdAt: 1 },
      }),
    ).toEqual({
      first_name: "Ada",
      roles: [{ role_id: "role-1" }],
      profile: { created_at: 1 },
    });
  });

  it.each([
    new Date("2026-01-01T00:00:00.000Z"),
    new FormData(),
    new Blob(["value"]),
  ])("leaves non-plain built-in values unchanged", (value) => {
    expect(toCamelCase(value)).toBe(value);
    expect(toSnakeCase(value)).toBe(value);
  });

  it("leaves class instances unchanged", () => {
    class Value {
      snake_key = "value";
    }

    const value = new Value();

    expect(toCamelCase(value)).toBe(value);
    expect(toSnakeCase(value)).toBe(value);
  });
});
