const requireHttpsUrl = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  const url = new URL(value);

  if (url.protocol !== "https:") {
    throw new Error(`${name} must use HTTPS`);
  }

  if (url.username || url.password) {
    throw new Error(`${name} must not contain credentials`);
  }
};

export default () => {
  requireHttpsUrl("STAGING_API_HEALTH_URL");
  requireHttpsUrl("STAGING_BASE_URL");
};
