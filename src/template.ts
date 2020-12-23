import { confirm } from "input";
import integration from "./integration";
import { writeFiles } from "./io";
import { Template, TemplateResult } from "./types";

const template = async (
  pkg: string,
  theTemplate: Template,
  outputDir: string,
  selectedPackages: string[],
): Promise<TemplateResult> => {
  const deps = [...(theTemplate.dependencies || [])];
  const devDeps = [...(theTemplate.devDependencies || [])];
  await writeFiles(theTemplate.files || [], outputDir);
  if (theTemplate.integrations) {
    for (const theIntegration of theTemplate.integrations) {
      const shouldUseIntegration = theIntegration.integration.every(pkg =>
        selectedPackages.includes(pkg),
      );
      if (shouldUseIntegration) {
        const { dependencies, devDependencies } = await integration(
          pkg,
          theIntegration,
          outputDir,
          selectedPackages,
        );
        deps.push(...dependencies);
        devDeps.push(...devDependencies);
      }
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
          outputDir,
          selectedPackages,
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
