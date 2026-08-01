import { describe, expect, it } from "vitest";

import {
  evaluateBundleAssets,
  maximumChunkBytes,
  maximumTotalBytes,
} from "./check-bundle-size.mjs";

describe("bundle size budgets", () => {
  it("returns the total and largest JavaScript asset", () => {
    expect(
      evaluateBundleAssets([
        { bytes: 100, name: "small.js" },
        { bytes: 200, name: "large.js" },
      ]),
    ).toEqual({
      largestAsset: { bytes: 200, name: "large.js" },
      totalBytes: 300,
    });
  });

  it("rejects an empty asset list", () => {
    expect(() => evaluateBundleAssets([])).toThrow("No JavaScript assets");
  });

  it("rejects an oversized chunk", () => {
    expect(() =>
      evaluateBundleAssets([{ bytes: maximumChunkBytes + 1, name: "app.js" }]),
    ).toThrow("app.js");
  });

  it("rejects an oversized total", () => {
    expect(() =>
      evaluateBundleAssets([
        { bytes: maximumTotalBytes / 2 + 1, name: "a.js" },
        { bytes: maximumTotalBytes / 2, name: "b.js" },
      ]),
    ).toThrow("Total JavaScript");
  });
});
