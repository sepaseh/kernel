import { describe, expect, it } from "vitest";

import {
  createLighthouseUrl,
  evaluateLighthouseReport,
  lighthouseThresholds,
  minimumPerformanceScore,
} from "./run-lighthouse.mjs";

const createReport = ({
  audits = {},
  score = minimumPerformanceScore,
} = {}) => ({
  audits: Object.fromEntries(
    Object.entries(lighthouseThresholds).map(([auditId, maximum]) => [
      auditId,
      { numericValue: audits[auditId] ?? maximum },
    ]),
  ),
  categories: { performance: { score } },
});

describe("Lighthouse advisory", () => {
  it.each([
    [undefined, "http://127.0.0.1:4174/auth"],
    ["/", "http://127.0.0.1:4174/auth"],
    ["/admin/", "http://127.0.0.1:4174/admin/auth"],
  ])("builds the authentication URL for base path %s", (basePath, url) => {
    expect(createLighthouseUrl(basePath)).toBe(url);
  });

  it("accepts a report at the advisory boundaries", () => {
    expect(evaluateLighthouseReport(createReport())).toBe(60);
  });

  it("reports the score and every audit that exceeds its threshold", () => {
    expect(() =>
      evaluateLighthouseReport(
        createReport({
          audits: {
            "first-contentful-paint": 6_001,
            "largest-contentful-paint": 6_501,
          },
          score: 0.599,
        }),
      ),
    ).toThrow(
      /performance score 60.*first-contentful-paint 6001\.00.*largest-contentful-paint 6501\.00/s,
    );
  });

  it("reports an unavailable required audit instead of crashing", () => {
    const report = createReport();
    delete report.audits.interactive;

    expect(() => evaluateLighthouseReport(report)).toThrow(
      "interactive unavailable",
    );
  });
});
