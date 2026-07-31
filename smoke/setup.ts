const validateHttpsUrl = (name: string) => {
  const value = process.env[name];

  if (!value) throw new Error(`${name} is required`);

  const url = new URL(value);

  if (url.protocol !== "https:") {
    throw new Error(`${name} must use HTTPS`);
  }
};

export default () => {
  validateHttpsUrl("SMOKE_API_HEALTH_URL");
  validateHttpsUrl("SMOKE_BASE_URL");
};
