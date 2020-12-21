import { existsSync, promises } from "fs";
import { resolve } from "path";
import changes from "./changes";
import template from "./template";
import { Integration, TemplateResult } from "./types";

const { readFile, writeFile } = promises;

const integration = async (
  pkg: string,
  theIntegration: Integration,
  outputDir: string,
  selectedPackages: string[],
): Promise<TemplateResult> => {
  const fullIntegrationName = theIntegration.integration.join("~");
  const fullPackageName = `${pkg}~(${fullIntegrationName})`;
  const templateResult = await template(
    fullPackageName,
    theIntegration.template,
    outputDir,
    selectedPackages,
  );
  if (theIntegration.overridesJSON) {
    for (const override of theIntegration.overridesJSON) {
      const { file } = override;
      const theChanges = override.changes;
      const path = resolve(outputDir, file);
      if (!existsSync(file)) {
        throw `${fullPackageName} expected ${path} to exist`;
      }
      const beforeBuffer = await readFile(path);
      const beforeRaw = beforeBuffer.toString();
      const before = JSON.parse(beforeRaw);
      const after = changes(before, theChanges);
      const afterRaw = JSON.stringify(after);
      await writeFile(path, afterRaw);
    }
  }
  return templateResult;
};

export default integration;
