import { defineConfig } from "vitest/config";

import { srcPath } from "./tooling/paths.ts";

export default defineConfig({
  resolve: {
    alias: {
      "@": srcPath,
    },
  },
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://localhost/",
      },
    },
    include: ["contract/**/*.contract.test.ts"],
    pool: "forks",
    sequence: {
      concurrent: false,
    },
  },
});
