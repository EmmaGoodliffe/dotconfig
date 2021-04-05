const isObject = (obj: unknown): obj is Record<string, unknown> =>
  obj instanceof Object && !(obj instanceof Array);

export const unique = <T>(arr: T[]): T[] => Array.from(new Set(arr));

export const sortJson = <T>(object: T): T => {
  if (object instanceof Array) {
    for (const i in object) {
      object[i] = sortJson(object[i]);
    }
    return object;
  } else if (isObject(object)) {
    const keys = Object.keys(object).sort();
    const newObject: Record<string, unknown> = {};
    for (const i in keys) {
      const key = keys[i];
      newObject[key] = sortJson(object[key]);
    }
    return newObject as T;
  }
  return object;
};
