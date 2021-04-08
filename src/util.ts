export const unique = <T>(arr: T[]): T[] => Array.from(new Set(arr));

const isObject = (obj: unknown): obj is Record<string, unknown> =>
  obj instanceof Object && !(obj instanceof Array);

export const sortJson = <T>(object: T): T => {
  if (object instanceof Array) {
    // for (const i in object) {
    //   object[i] = sortJson(object[i]);
    // }
    // return object;
    return (object.map(sortJson) as unknown) as T;
  } else if (isObject(object)) {
    const keys = Object.keys(object).sort();
    const newObject: Record<string, unknown> = {};
    // for (const i in keys) {
    //   const key = keys[i];
    //   newObject[key] = sortJson(object[key]);
    // }
    for (const key of keys) {
      newObject[key] = sortJson(object[key]);
    }
    return newObject as T;
  }
  return object;
};
