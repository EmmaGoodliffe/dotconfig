import { existsSync } from "fs";
import { resolve } from "path";
import runChanges from "./change";
import { readFile, writeFile, writeFiles } from "./io";
import { Template } from "./types";

const runTemplate = async (
  pkg: string,
  template: Template,
  selectedPackages: string[],
  outputDir: string,
): Promise<{
  dependencies: string[];
  devDependencies: string[];
}> => {
  const deps = template.dependencies ? [...template.dependencies] : [];
  const devDeps = template.devDependencies ? [...template.devDependencies] : [];
  await writeFiles(template.files, outputDir);
  if (template.integrations) {
    for (const integration of template.integrations) {
      const useIntegration = integration.integration.every(pkg =>
        selectedPackages.includes(pkg),
      );
      if (useIntegration) {
        await writeFiles(integration.template.files, outputDir);
        // TODO: Complete other parts of template
        if (integration.overridesJSON) {
          for (const override of integration.overridesJSON) {
            const { file, changes } = override;
            const path = resolve(outputDir, file);
            if (!existsSync(file)) {
              throw `${pkg}~${integration.integration} expected ${path} to exist`;
            }
            const beforeBuffer = await readFile(file);
            const beforeRaw = beforeBuffer.toString();
            const before = JSON.parse(beforeRaw);
            const after = runChanges(before, changes);
            const afterRaw = JSON.stringify(after);
            writeFile(file, afterRaw);
          }
        }
      }
    }
  }
  if (template.extensions) {
    for (const extension in template.extensions) {
      const question = `Do you want to set up ${pkg} with ${extension}`;
      console.log({ question });
      // TODO: ask question
      const answer = false;
      if (answer) {
        const extTemplate = template.extensions[extension];
        const { dependencies, devDependencies } = await runTemplate(
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

export default runTemplate;
