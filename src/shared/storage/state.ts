export const getState = <T>(key: string, initialValue: T): T => {
  const value = localStorage.getItem(key);

  if (value === null) return initialValue;

  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
};

export const setState = <T>(key: string, value: T): void => {
  const serialized = JSON.stringify(value);

  if (serialized === undefined) {
    throw new TypeError("State value is not JSON-serializable");
  }

  localStorage.setItem(key, serialized);
};
