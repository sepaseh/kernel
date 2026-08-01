import { describe, expect, it } from "vitest";

import {
  parseConfiguredHostname,
  parseHttpsTarget,
  validateDastTarget,
  validateSmokeTargets,
  validateStagingTargets,
} from "./validate-workflow-targets.mjs";

const staging = {
  STAGING_ALLOWED_API_HOST: "api.staging.example.com",
  STAGING_ALLOWED_APP_HOST: "staging.example.com",
  STAGING_API_HEALTH_URL: "https://api.staging.example.com/health",
  STAGING_BASE_URL: "https://staging.example.com/app/",
};

describe("workflow target validation", () => {
  it("normalizes canonical hostnames", () => {
    expect(parseConfiguredHostname("HOST", "EXAMPLE.COM")).toBe("example.com");
  });

  it.each([
    " example.com",
    "example.com:443",
    "https://example.com",
    "-bad.example",
  ])("rejects invalid configured hostname %s", (host) =>
    expect(() => parseConfiguredHostname("HOST", host)).toThrow(),
  );

  it.each(["http://example.com", "https://user:pass@example.com"])(
    "rejects unsafe target %s",
    (url) => expect(() => parseHttpsTarget("TARGET", url)).toThrow(),
  );

  it("accepts staging targets on the configured hosts", () => {
    expect(() => validateStagingTargets(staging)).not.toThrow();
  });

  it("rejects a staging host mismatch", () => {
    expect(() =>
      validateStagingTargets({
        ...staging,
        STAGING_BASE_URL: "https://other.example.com",
      }),
    ).toThrow("not explicitly allowed");
  });

  it("requires matching immutable smoke deployment IDs", () => {
    const smoke = {
      SMOKE_ALLOWED_API_HOST: staging.STAGING_ALLOWED_API_HOST,
      SMOKE_ALLOWED_APP_HOST: staging.STAGING_ALLOWED_APP_HOST,
      SMOKE_API_HEALTH_URL: staging.STAGING_API_HEALTH_URL,
      SMOKE_BASE_URL: staging.STAGING_BASE_URL,
      SMOKE_DEPLOYMENT_ID: "candidate",
      SMOKE_EXPECTED_DEPLOYMENT_ID: "expected",
    };
    expect(() => validateSmokeTargets(smoke)).toThrow("expected deployment");
    expect(() =>
      validateSmokeTargets({
        ...smoke,
        SMOKE_EXPECTED_DEPLOYMENT_ID: "candidate",
      }),
    ).not.toThrow();
  });

  it("allows authorized staging DAST and blocks production", () => {
    const env = {
      DAST_ALLOWED_HOST: "staging.example.com",
      DAST_PRODUCTION_HOST: "example.com",
      DAST_TARGET: "https://staging.example.com",
    };
    expect(() => validateDastTarget(env)).not.toThrow();
    expect(() =>
      validateDastTarget({
        ...env,
        DAST_ALLOWED_HOST: "example.com",
        DAST_TARGET: "https://example.com",
      }),
    ).toThrow("must not target the production host");
  });
});
