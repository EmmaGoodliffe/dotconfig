import { existsSync, mkdirSync, promises } from "fs";
import { checkboxes } from "input";
import fetch from "node-fetch";
import { dirname, resolve } from "path";
import { parse } from "url";
import { argv } from "yargs";

const { readFile, writeFile } = promises;

interface File_ {
  file: string;
  url?: string;
}

interface Integration {
  integration: string[];
  template: Template;
}

interface Template {
  files?: File_[];
  integrations?: Integration[];
  dependencies?: string[];
  devDependencies?: string[];
  npx?: string[];
  extensions?: {
    [name: string]: Template;
  };
}
interface Templates {
  [pkg: string]: Template;
}

const templatesPath = resolve(__dirname, "./data.json");
const defaultUrl =
  "https://raw.githubusercontent.com/EmmaGoodliffe/default/master/";

const recursivelyCreateDir = (path: string): void => {
  const parent = dirname(path);
  const pathExists = existsSync(path);
  const parentExists = existsSync(parent);
  if (pathExists) {
    return;
  } else if (parentExists) {
    mkdirSync(path);
    return;
  } else {
    recursivelyCreateDir(parent);
    mkdirSync(path);
    return;
  }
};

const getFile = async (url: string) => {
  const isFile = parse(url).protocol === null;
  if (isFile) {
    const buffer = await readFile(resolve(__dirname, url));
    const raw = buffer.toString();
    return raw;
  } else {
    const response = await fetch(url);
    const raw = await response.text();
    return raw;
  }
};

const writeFiles = async (files: File_[] = [], outputDir: string) => {
  const promises = files.map(async file => {
    const url = file.url || defaultUrl + file.file;
    const raw = await getFile(url);
    const path = resolve(outputDir, file.file);
    const dir = dirname(path);
    recursivelyCreateDir(dir);
    await writeFile(path, raw);
  });
  return await Promise.all(promises);
};

const runTemplate = async (
  pkg: string,
  template: Template,
  selectedPackages: string[],
  outputDir: string,
) => {
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

const run = async (outputDir: string | number) => {
  if (typeof outputDir !== "string") {
    throw `Expected output directory to be a string. Received ${outputDir}`;
  }
  const absoluteOutputDir = resolve(outputDir);
  if (!existsSync(absoluteOutputDir)) {
    try {
      mkdirSync(absoluteOutputDir);
    } catch (err) {
      const parentDir = dirname(absoluteOutputDir);
      throw `Expected ${parentDir} to exist`;
    }
  }
  const templatesBuffer = await readFile(templatesPath);
  const rawTemplates = templatesBuffer.toString();
  const templates: Templates = JSON.parse(rawTemplates);
  const allPackages = Object.keys(templates);
  const selectedPackages = await checkboxes<string>(
    "Select which packages to auto-configure",
    allPackages.map(pkg => ({ name: pkg })),
  );
  const selectedTemplates = selectedPackages.map(pkg => templates[pkg]);
  const allDeps: string[] = [];
  const allDevDeps: string[] = [];
  for (let i = 0; i < selectedPackages.length; i++) {
    const pkg = selectedPackages[i];
    const template = selectedTemplates[i];
    const { dependencies, devDependencies } = await runTemplate(
      pkg,
      template,
      selectedPackages,
      absoluteOutputDir,
    );
    allDeps.push(...dependencies);
    allDevDeps.push(...devDependencies);
  }
  const commandsToRun = [
    "npm init",
    `npm i ${allDeps.join(" ")}`,
    `npm i -D ${allDevDeps.join(" ")}`,
  ];
  console.log({ commandsToRun });
};

run(argv._[0]).catch(console.error);
