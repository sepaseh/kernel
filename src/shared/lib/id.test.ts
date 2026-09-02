import { afterEach, describe, expect, it, vi } from "vitest";

import { tinyId } from "./id";

afterEach(() => vi.restoreAllMocks());

describe("tinyId", () => {
  it("creates a six-character base-36 identifier", () => {
    vi.spyOn(crypto, "getRandomValues").mockImplementation((values) => {
      new Uint8Array(values.buffer).set([4, 15, 35, 35, 35, 33]);

      return values;
    });

    expect(tinyId()).toBe("4fzzzx");
  });

  it("keeps zero-valued bytes in the identifier", () => {
    vi.spyOn(crypto, "getRandomValues").mockImplementation((values) => {
      new Uint8Array(values.buffer).set([18, 0, 0, 0, 0, 0]);

      return values;
    });

    expect(tinyId()).toBe("i00000");
  });
});
