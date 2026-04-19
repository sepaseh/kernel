import { describe, expect, it } from "vitest";

import {
  camelCaseToTitle,
  kebabCaseToTitle,
  match,
  parseBase64DataUrl,
  snakeCaseToTitle,
  tinyId,
} from "./format";

describe("camelCaseToTitle", () => {
  it("converts camelCase to title case", () => {
    expect(camelCaseToTitle("helloWorld")).toBe("Hello World");
    expect(camelCaseToTitle("myVariableName")).toBe("My Variable Name");
  });

  it("returns empty input as-is", () => {
    expect(camelCaseToTitle("")).toBe("");
  });
});

describe("kebabCaseToTitle", () => {
  it("converts kebab-case to title case", () => {
    expect(kebabCaseToTitle("hello-world")).toBe("Hello World");
    expect(kebabCaseToTitle("my-variable-name")).toBe("My Variable Name");
  });

  it("returns empty input as-is", () => {
    expect(kebabCaseToTitle("")).toBe("");
  });
});

describe("snakeCaseToTitle", () => {
  it("converts snake_case to title case", () => {
    expect(snakeCaseToTitle("hello_world")).toBe("Hello World");
    expect(snakeCaseToTitle("my_variable_name")).toBe("My Variable Name");
  });

  it("returns empty input as-is", () => {
    expect(snakeCaseToTitle("")).toBe("");
  });
});

describe("match", () => {
  it("calls the matching handler", () => {
    const result = match("a" as "a" | "b", {
      a: () => 1,
      b: () => 2,
    });

    expect(result).toBe(1);
  });
});

describe("parseBase64DataUrl", () => {
  it("parses a valid data URL", () => {
    const { base64, mime } = parseBase64DataUrl(
      "data:image/png;base64,abc123",
    );

    expect(mime).toBe("image/png");
    expect(base64).toBe("abc123");
  });

  it("returns empty strings for malformed input", () => {
    const { base64, mime } = parseBase64DataUrl("invalid");

    expect(mime).toBe("");
    expect(base64).toBe("");
  });
});

describe("tinyId", () => {
  it("returns a 6-character alphanumeric string", () => {
    expect(tinyId()).toMatch(/^[a-z0-9]{6}$/);
  });

  it("returns unique values", () => {
    expect(tinyId()).not.toBe(tinyId());
  });
});
