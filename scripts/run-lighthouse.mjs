import console from "node:console";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

const reportDirectory = path.resolve(".lighthouseci");

// These intentionally broad limits catch major regressions without treating a
// shared CI runner as a production performance environment.
export const lighthouseThresholds = {
  "cumulative-layout-shift": 0.2,
  "first-contentful-paint": 6_000,
  interactive: 7_000,
  "largest-contentful-paint": 6_500,
  "total-blocking-time": 600,
};
export const minimumPerformanceScore = 0.6;

export const createLighthouseUrl = (appBasePath = "/") => {
  const normalizedBasePath = appBasePath.replace(/^\/+|\/+$/g, "");

  return new URL(
    `/${[normalizedBasePath, "auth"].filter(Boolean).join("/")}`,
    "http://127.0.0.1:4174",
  ).href;
};

export const evaluateLighthouseReport = (lhr) => {
  const failures = [];
  const performanceScore = lhr.categories.performance.score ?? 0;
  if (performanceScore < minimumPerformanceScore) {
    failures.push(
      `performance score ${Math.round(performanceScore * 100)} (minimum ${minimumPerformanceScore * 100})`,
    );
  }

  for (const [auditId, maximum] of Object.entries(lighthouseThresholds)) {
    const value = lhr.audits[auditId]?.numericValue;
    if (value === undefined || value > maximum) {
      failures.push(
        `${auditId} ${value?.toFixed(2) ?? "unavailable"} (maximum ${maximum})`,
      );
    }
  }

  if (failures.length > 0) {
    throw new Error(
      `Lighthouse advisory thresholds exceeded:\n${failures.join("\n")}`,
    );
  }

  return Math.round(performanceScore * 100);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [chromeLauncher, { default: lighthouse }, { preview }] =
    await Promise.all([
      import("chrome-launcher"),
      import("lighthouse"),
      import("vite"),
    ]);
  const url = createLighthouseUrl(process.env.VITE_APP_BASE_URL);
  const server = await preview({
    preview: {
      host: "127.0.0.1",
      port: 4174,
      strictPort: true,
    },
  });
  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless=new"],
  });

  try {
    const result = await lighthouse(url, {
      logLevel: "error",
      onlyCategories: ["performance"],
      output: ["html", "json"],
      port: chrome.port,
    });
    if (!result) throw new Error("Lighthouse did not produce a result");

    const reports = Array.isArray(result.report)
      ? result.report
      : [result.report];
    await mkdir(reportDirectory, { recursive: true });
    await Promise.all([
      writeFile(path.join(reportDirectory, "report.html"), reports[0]),
      writeFile(path.join(reportDirectory, "report.json"), reports[1]),
    ]);

    const performanceScore = evaluateLighthouseReport(result.lhr);
    console.log(
      `Lighthouse advisory passed with a performance score of ${performanceScore}.`,
    );
  } finally {
    try {
      await chrome.kill();
    } catch (error) {
      console.warn(`Chrome cleanup warning: ${error.message}`);
    }
    await new Promise((resolve, reject) => {
      server.httpServer.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}
