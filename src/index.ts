import { existsSync, mkdirSync } from "fs";
import { checkboxes } from "input";
import { dirname, resolve } from "path";
import { argv } from "yargs";
import { readFile } from "./io";
import runSchema from "./schema";
import runTemplate from "./template";
import { Templates } from "./types";

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
    runSchema(templates, schemaPath);
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
  const commandsToRun = ["npm init"];
  allDeps.length && commandsToRun.push(`npm i ${allDeps.join(" ")}`);
  allDevDeps.length && commandsToRun.push(`npm i -D ${allDevDeps.join(" ")}`);
  console.log({ commandsToRun });
};

run(argv._[0]).catch(console.error);
