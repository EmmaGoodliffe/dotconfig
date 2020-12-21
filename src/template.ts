import { confirm } from "input";
import integration from "./integration";
import { writeFiles } from "./io";
import { Template } from "./types";

const template = async (
  pkg: string,
  theTemplate: Template,
  selectedPackages: string[],
  outputDir: string,
): Promise<{
  commands: string[];
  dependencies: string[];
  devDependencies: string[];
}> => {
  const deps = [...(theTemplate.dependencies || [])];
  const devDeps = [...(theTemplate.devDependencies || [])];
  await writeFiles(theTemplate.files, outputDir);
  if (theTemplate.integrations) {
    for (const theIntegration of theTemplate.integrations) {
      const shouldUseIntegration = theIntegration.integration.every(pkg =>
        selectedPackages.includes(pkg),
      );
      shouldUseIntegration && integration(pkg, theIntegration, outputDir);
    }
  }
  if (theTemplate.extensions) {
    for (const extension in theTemplate.extensions) {
      const question = `Do you want to set up ${pkg} with ${extension}`;
      const theExtension = theTemplate.extensions[extension];
      const options = { default: theExtension.default };
      const shouldUseExtension = await confirm(question, options);
      if (shouldUseExtension) {
        const { dependencies, devDependencies } = await template(
          `${pkg}:${extension}`,
          theExtension.template,
          selectedPackages,
          outputDir,
        );
        deps.push(...dependencies);
        devDeps.push(...devDependencies);
      }
    }
  }
  return {
    commands: theTemplate.commands || [],
    dependencies: deps,
    devDependencies: devDeps,
  };
};

export default template;
