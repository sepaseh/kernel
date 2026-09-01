export const tinyId = () => {
  const values = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(values, (value) => value.toString(36).slice(-1)).join("");
};
