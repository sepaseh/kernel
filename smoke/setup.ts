const validateUrl = (name: string) => {
  const value = process.env[name];

  if (!value) throw new Error(`${name} is required`);

  new URL(value);
};

export default () => {
  validateUrl("SMOKE_API_HEALTH_URL");
  validateUrl("SMOKE_BASE_URL");
};
