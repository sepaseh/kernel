import { describe, expect, it } from "vitest";

import { toCamelCase, toSnakeCase } from "./transform";

describe("case transforms", () => {
  it("converts nested API responses to camel case", () => {
    expect(
      toCamelCase({
        first_name: "Ada",
        role_ids: ["role-1"],
        workspace: { created_at: 1 },
      }),
    ).toEqual({
      firstName: "Ada",
      roleIds: ["role-1"],
      workspace: { createdAt: 1 },
    });
  });

  it("converts nested request bodies to snake case", () => {
    expect(
      toSnakeCase({
        firstName: "Ada",
        roleIds: ["role-1"],
        workspace: { createdAt: 1 },
      }),
    ).toEqual({
      first_name: "Ada",
      role_ids: ["role-1"],
      workspace: { created_at: 1 },
    });
  });
});
