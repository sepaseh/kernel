import process from "node:process";
import { fileURLToPath, URL } from "node:url";

const hostnamePattern =
  /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export const parseConfiguredHostname = (name, rawValue) => {
  if (!rawValue || rawValue !== rawValue.trim()) {
    throw new Error(`${name} must be a hostname without whitespace`);
  }
  const normalized = rawValue.toLowerCase();
  if (!hostnamePattern.test(normalized)) {
    throw new Error(`${name} must contain a hostname only`);
  }
  const parsed = new URL(`http://${rawValue}`);
  if (parsed.hostname !== normalized) {
    throw new Error(`${name} must be a canonical hostname only`);
  }
  return parsed.hostname;
};

export const parseTarget = (name, rawValue) => {
  if (!rawValue) throw new Error(`${name} is required`);
  const url = new URL(rawValue);
  if (url.username || url.password) {
    throw new Error(`${name} must not contain credentials`);
  }
  return url;
};

const stagingLabels = {
  allowedApiHost: "STAGING_ALLOWED_API_HOST",
  allowedAppHost: "STAGING_ALLOWED_APP_HOST",
  apiHealthUrl: "STAGING_API_HEALTH_URL",
  baseUrl: "STAGING_BASE_URL",
};

export const validateStagingTargets = (env, labels = stagingLabels) => {
  const appUrl = parseTarget(labels.baseUrl, env.STAGING_BASE_URL);
  const apiUrl = parseTarget(labels.apiHealthUrl, env.STAGING_API_HEALTH_URL);
  const allowedAppHost = parseConfiguredHostname(
    labels.allowedAppHost,
    env.STAGING_ALLOWED_APP_HOST,
  );
  const allowedApiHost = parseConfiguredHostname(
    labels.allowedApiHost,
    env.STAGING_ALLOWED_API_HOST,
  );
  if (appUrl.hostname.toLowerCase() !== allowedAppHost) {
    throw new Error(`${labels.baseUrl} host is not explicitly allowed`);
  }
  if (apiUrl.hostname.toLowerCase() !== allowedApiHost) {
    throw new Error(`${labels.apiHealthUrl} host is not explicitly allowed`);
  }
};

export const validateSmokeTargets = (env) => {
  validateStagingTargets(
    {
      STAGING_ALLOWED_API_HOST: env.SMOKE_ALLOWED_API_HOST,
      STAGING_ALLOWED_APP_HOST: env.SMOKE_ALLOWED_APP_HOST,
      STAGING_API_HEALTH_URL: env.SMOKE_API_HEALTH_URL,
      STAGING_BASE_URL: env.SMOKE_BASE_URL,
    },
    {
      allowedApiHost: "SMOKE_ALLOWED_API_HOST",
      allowedAppHost: "SMOKE_ALLOWED_APP_HOST",
      apiHealthUrl: "SMOKE_API_HEALTH_URL",
      baseUrl: "SMOKE_BASE_URL",
    },
  );
  if (!env.SMOKE_DEPLOYMENT_ID || !env.SMOKE_EXPECTED_DEPLOYMENT_ID) {
    throw new Error(
      "SMOKE_DEPLOYMENT_ID and SMOKE_EXPECTED_DEPLOYMENT_ID are required",
    );
  }
  if (env.SMOKE_DEPLOYMENT_ID !== env.SMOKE_EXPECTED_DEPLOYMENT_ID) {
    throw new Error("The smoke targets do not match the expected deployment");
  }
};

export const validateDastTarget = (env) => {
  const target = parseTarget("DAST_TARGET", env.DAST_TARGET);
  const allowedHost = parseConfiguredHostname(
    "STAGING_ALLOWED_APP_HOST",
    env.DAST_ALLOWED_HOST,
  );
  const productionHost = parseConfiguredHostname(
    "PRODUCTION_HOST",
    env.DAST_PRODUCTION_HOST,
  );
  if (target.hostname.toLowerCase() !== allowedHost) {
    throw new Error("DAST_TARGET host is not explicitly allowed");
  }
  if (target.hostname.toLowerCase() === productionHost) {
    throw new Error("DAST must not target the production host");
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const validators = {
    dast: validateDastTarget,
    smoke: validateSmokeTargets,
    staging: validateStagingTargets,
  };
  const validator = validators[process.argv[2]];
  if (!validator)
    throw new Error("Expected validation mode: staging, smoke, or dast");
  validator(process.env);
}
