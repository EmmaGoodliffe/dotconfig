import { existsSync, mkdirSync, promises } from "fs";
import { checkboxes } from "input";
import { dirname, resolve } from "path";
import { argv } from "yargs";
import { writeFiles } from "./io";
import schema from "./schema";
import template from "./template";
import { Templates } from "./types";

const { readFile } = promises;

const templatesPath = resolve(__dirname, "./data.json");
const schemaPath = resolve(__dirname, "../dist/schema.json");

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
  try {
    schema(templates, schemaPath);
  } catch (err) {
    throw `The data in ${templatesPath} does not match the automatically generated schema: ${err}`;
  }
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
    const selectedTemplate = selectedTemplates[i];
    const { dependencies, devDependencies } = await template(
      pkg,
      selectedTemplate,
      absoluteOutputDir,
      selectedPackages,
    );
    allDeps.push(...dependencies);
    allDevDeps.push(...devDependencies);
  }
  await writeFiles(
    [{ file: "package.json", commands: ["npm init"], override: true }],
    outputDir,
  );
  const allUniqueDeps = Array.from(new Set(allDeps));
  const allUniqueDevDeps = Array.from(new Set(allDevDeps));
  const depsCommand = `npm i ${allUniqueDeps.join(" ")}`;
  const devDepsCommand = `npm i -D ${allUniqueDevDeps.join(" ")}`;
  const allCommands = [];
  allUniqueDeps.length && allCommands.push(depsCommand);
  allUniqueDevDeps.length && allCommands.push(devDepsCommand);
  console.log({ allCommands });
};

run(argv._[0]).catch(console.error);
