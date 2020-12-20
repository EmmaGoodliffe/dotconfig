import { Change } from "./types";

const runChanges = (
  input: Record<string, unknown>,
  changes: Change[],
): Record<string, unknown> => {
  const result = { ...input };
  for (const change of changes) {
    if (change.type === "Array") {
      if (change.modifier.add !== undefined) {
        const value = change.modifier.add;
        const previousValues = result[change.key] as unknown[];
        result[change.key] = [...previousValues, value];
      }
    } else if (change.type === "Object") {
      if (change.modifier.set !== undefined) {
        const previousValues = result[change.key] as Record<string, unknown>;
        result[change.key] = { ...previousValues, ...change.modifier.set };
      }
    }
  }
  return result;
};

export default runChanges;
