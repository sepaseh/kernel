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
        workspace: { created_at: 1 },
      }),
    ).toEqual({
      displayName: "Ada",
      firstName: "Ada",
      onComplete: callback,
      roleIds: ["role-1"],
      workspace: { createdAt: 1 },
    });
  });

  it("converts nested request bodies to snake case", () => {
    expect(
      toSnakeCase({
        firstName: "Ada",
        roles: [{ roleId: "role-1" }],
        workspace: { createdAt: 1 },
      }),
    ).toEqual({
      first_name: "Ada",
      roles: [{ role_id: "role-1" }],
      workspace: { created_at: 1 },
    });
  });
});
