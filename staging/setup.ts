const requireUrl = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  const url = new URL(value);

  if (url.username || url.password) {
    throw new Error(`${name} must not contain credentials`);
  }
};

export default () => {
  requireUrl("STAGING_API_HEALTH_URL");
  requireUrl("STAGING_BASE_URL");
};
