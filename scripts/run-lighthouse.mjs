import console from "node:console";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import { preview } from "vite";

const reportDirectory = path.resolve(".lighthouseci");
const url = "https://127.0.0.1:4174/auth";
const thresholds = {
  "cumulative-layout-shift": 0.1,
  "first-contentful-paint": 4_000,
  interactive: 4_500,
  "largest-contentful-paint": 4_000,
  "total-blocking-time": 300,
};

const server = await preview({
  preview: {
    host: "127.0.0.1",
    port: 4174,
    strictPort: true,
  },
});
const chrome = await chromeLauncher.launch({
  chromeFlags: [
    "--headless=new",
    "--ignore-certificate-errors",
    "--no-sandbox",
  ],
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

  const failures = [];
  const performanceScore = result.lhr.categories.performance.score ?? 0;

  if (performanceScore < 0.75) {
    failures.push(
      `performance score ${Math.round(performanceScore * 100)} (minimum 75)`,
    );
  }

  for (const [auditId, maximum] of Object.entries(thresholds)) {
    const value = result.lhr.audits[auditId].numericValue;

    if (value === undefined || value > maximum) {
      failures.push(
        `${auditId} ${value?.toFixed(2) ?? "unavailable"} (maximum ${maximum})`,
      );
    }
  }

  if (failures.length > 0) {
    throw new Error(`Lighthouse budget exceeded:\n${failures.join("\n")}`);
  }

  console.log(
    `Lighthouse budgets passed with a performance score of ${Math.round(performanceScore * 100)}.`,
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
