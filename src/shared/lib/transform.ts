const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

const isObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== "object" || isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const toCamel = (value: string) =>
  value.replace(/([-_][a-z])/gi, ($1) =>
    $1.toUpperCase().replace("-", "").replace("_", ""),
  );

const toSnake = (value: string) =>
  value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const toCamelCase = <T>(obj: T): T => {
  if (isObject(obj)) {
    const result: Record<string, unknown> = {};
    Object.keys(obj).forEach((key) => {
      result[toCamel(key)] = toCamelCase(obj[key]);
    });
    return result as T;
  } else if (isArray(obj)) {
    return obj.map((item) => toCamelCase(item)) as T;
  }
  return obj;
};

export const toSnakeCase = <T>(obj: T): T => {
  if (isObject(obj)) {
    const result: Record<string, unknown> = {};
    Object.keys(obj).forEach((key) => {
      result[toSnake(key)] = toSnakeCase(obj[key]);
    });
    return result as T;
  } else if (isArray(obj)) {
    return obj.map((item) => toSnakeCase(item)) as T;
  }
  return obj;
};
