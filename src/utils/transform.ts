const isArray = (arr: any): arr is any[] => Array.isArray(arr);

const isObject = (obj: any): obj is Record<string, any> =>
  obj === Object(obj) && !isArray(obj) && typeof obj !== "function";

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
      result[toCamel(key)] = toCamelCase((obj as Record<string, unknown>)[key]);
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
      result[toSnake(key)] = toSnakeCase((obj as Record<string, unknown>)[key]);
    });
    return result as T;
  } else if (isArray(obj)) {
    return obj.map((item) => toSnakeCase(item)) as T;
  }
  return obj;
};
