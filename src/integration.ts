import { existsSync, promises } from "fs";
import { resolve } from "path";
import changes from "./changes";
import { writeFiles } from "./io";
import { Integration } from "./types";

const { readFile, writeFile } = promises;

const integration = async (
  pkg: string,
  theIntegration: Integration,
  outputDir: string,
): Promise<void> => {
  await writeFiles(theIntegration.template.files, outputDir);
  // TODO: Complete other parts of integration
  if (theIntegration.overridesJSON) {
    for (const override of theIntegration.overridesJSON) {
      const { file } = override;
      const theChanges = override.changes;
      const path = resolve(outputDir, file);
      if (!existsSync(file)) {
        throw `${pkg}~${theIntegration.integration} expected ${path} to exist`;
      }
      const beforeBuffer = await readFile(path);
      const beforeRaw = beforeBuffer.toString();
      const before = JSON.parse(beforeRaw);
      const after = changes(before, theChanges);
      const afterRaw = JSON.stringify(after);
      await writeFile(path, afterRaw);
    }
  }
};

export default integration;
