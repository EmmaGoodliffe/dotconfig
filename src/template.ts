import { existsSync, promises } from "fs";
import { resolve } from "path";
import changes from "./changes";
import { writeFiles } from "./io";
import { Template } from "./types";

const { readFile, writeFile } = promises;

const template = async (
  pkg: string,
  theTemplate: Template,
  selectedPackages: string[],
  outputDir: string,
): Promise<{
  dependencies: string[];
  devDependencies: string[];
}> => {
  const deps = [...(theTemplate.dependencies || [])];
  const devDeps = [...(theTemplate.devDependencies || [])];
  await writeFiles(theTemplate.files, outputDir);
  if (theTemplate.integrations) {
    for (const integration of theTemplate.integrations) {
      const useIntegration = integration.integration.every(pkg =>
        selectedPackages.includes(pkg),
      );
      if (useIntegration) {
        await writeFiles(integration.template.files, outputDir);
        // TODO: Complete other parts of template
        if (integration.overridesJSON) {
          for (const override of integration.overridesJSON) {
            const { file } = override;
            const theChanges = override.changes;
            const path = resolve(outputDir, file);
            if (!existsSync(file)) {
              throw `${pkg}~${integration.integration} expected ${path} to exist`;
            }
            const beforeBuffer = await readFile(path);
            const beforeRaw = beforeBuffer.toString();
            const before = JSON.parse(beforeRaw);
            const after = changes(before, theChanges);
            const afterRaw = JSON.stringify(after);
            await writeFile(path, afterRaw);
          }
        }
      }
    }
  }
  if (theTemplate.extensions) {
    for (const extension in theTemplate.extensions) {
      const question = `Do you want to set up ${pkg} with ${extension}`;
      console.log({ question });
      // TODO: ask question
      const answer = false;
      if (answer) {
        const extTemplate = theTemplate.extensions[extension];
        const { dependencies, devDependencies } = await template(
          `${pkg}:${extension}`,
          extTemplate,
          selectedPackages,
          outputDir,
        );
        deps.push(...dependencies);
        devDeps.push(...devDependencies);
      }
    }
  }
  return {
    dependencies: deps,
    devDependencies: devDeps,
  };
};

export default template;
