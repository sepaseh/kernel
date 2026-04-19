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
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch {
    localStorage.setItem(key, value as string);
  }
};
