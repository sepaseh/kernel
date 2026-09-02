import { spawnSync } from "node:child_process";
import path from "node:path";

import { describe, expect, it } from "vitest";

const hasBashAndJq =
  spawnSync("bash", ["-lc", "command -v jq"], { encoding: "utf8" }).status ===
  0;
const hook = path.resolve(".agents/hooks/block-dangerous.sh");
const runHook = (payload) =>
  spawnSync("bash", [hook], {
    encoding: "utf8",
    input: JSON.stringify(payload),
  });

describe.skipIf(!hasBashAndJq)("AI dangerous-command hook", () => {
  it.each([
    ["force push", { command: "git push --force origin feature" }],
    ["hard reset", { command: "git reset --hard HEAD~1" }],
    ["direct main push", { command: "git push origin main" }],
    ["secret edit", { file_path: ".env.production" }],
    ["environment dump", { command: "printenv" }],
    ["production endpoint", { command: "curl http://production.example.com" }],
  ])("blocks %s", (_name, payload) => {
    expect(runHook(payload).status).toBe(2);
  });

  it("allows safe commands and malformed input", () => {
    expect(runHook({ command: "npm run lint" }).status).toBe(0);
    expect(
      spawnSync("bash", [hook], { encoding: "utf8", input: "not-json" }).status,
    ).toBe(0);
  });
});
