import { existsSync, mkdirSync, promises } from "fs";
import { checkboxes } from "input";
import fetch from "node-fetch";
import { dirname, resolve } from "path";
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
  npm?: string[];
  npx?: string[];
  extensions?: {
    [name: string]: Template;
  };
}
interface Templates {
  [pkg: string]: Template;
}

const templatesPath = resolve(__dirname, "../templates.json");
const defaultUrl =
  "https://raw.githubusercontent.com/EmmaGoodliffe/default/master/";

const recursivelyCreateDir = (path: string): void => {
  const parent = dirname(path);
  const pathExists = existsSync(path);
  const parentExists = existsSync(parent);
  if (pathExists) {
    return;
  } else if (parentExists) {
    return mkdirSync(path);
  } else {
    return recursivelyCreateDir(parent);
  }
};

const run = async (outputDir: string | number) => {
  if (typeof outputDir !== "string") {
    throw `Expected output directory to be a string. Received ${outputDir}`;
  }
  const absoluteOutputDir = resolve(dirname(""), outputDir);
  if (!existsSync(absoluteOutputDir)) {
    try {
      mkdirSync(absoluteOutputDir);
    } catch (err) {
      throw `Expected ${dirname(absoluteOutputDir)} to exist`;
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
  const pkgPromises = selectedTemplates.map(template => {
    const filePromises = template.files?.map(async file => {
      const url = file.url || defaultUrl + file.file;
      const raw = await fetch(url);
      const text = await raw.text();
      const path = resolve(absoluteOutputDir, file.file);
      const dir = dirname(path);
      recursivelyCreateDir(dir);
      await writeFile(path, text);
    });
    return Promise.all(filePromises || []);
  });
  await Promise.all(pkgPromises);
};

run(argv._[0]).catch(console.error);
