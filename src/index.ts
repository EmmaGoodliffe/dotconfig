import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { checkboxes, confirm } from "input";
import fetch from "node-fetch";
import { dirname, join } from "path";
import esLintConfigBase from "./content/.eslintrc.json";

const dir = join(__dirname, "../output");
const defaultUrl =
  "https://raw.githubusercontent.com/EmmaGoodliffe/default/master/";
const packages = [
  "API Extractor",
  "Dotenv",
  "ESLint",
  "Git",
  "GitHub",
  "Jest",
  "Prettier",
  "Svelte",
  "Tailwind",
  "TypeScript",
] as const;

type Extends<T, U extends T> = U;

type Package = typeof packages[number];

type EsLintConfig = typeof esLintConfigBase & {
  parser?: string;
  rules?: { [key: string]: unknown };
};

const getExtensionQuestion = (base: Package, extension: Package) =>
  `Do you want to configure ${base} with ${extension}?`;

const getEsLintConfig = (
  base: EsLintConfig,
  extension: Extends<Package, "Prettier" | "TypeScript">,
) => {
  if (extension === "Prettier") {
    return {
      ...base,
      plugins: [...base.plugins, "prettier"],
      rules: { ...base.rules, "prettier/prettier": "error" },
    };
  } else if (extension === "TypeScript") {
    return {
      ...base,
      extends: [
        ...base.extends,
        "plugin:@typescript-eslint/recommended",
        "plugin:import/typescript",
      ],
      parser: "@typescript-eslint/parser",
      plugins: [...base.plugins, "@typescript-eslint"],
      rules: {
        ...base.rules,
        "@typescript-eslint/no-empty-function": [
          "error",
          { allow: ["arrowFunctions"] },
        ],
      },
    };
  }
  return base;
};

const isObject = (obj: unknown): obj is Record<string, unknown> =>
  obj instanceof Object && !(obj instanceof Array);

const sortJson = <T>(object: T) => {
  if (object instanceof Array) {
    for (const i in object) {
      object[i] = sortJson(object[i]);
    }
    return object;
  } else if (isObject(object)) {
    const keys = Object.keys(object).sort();
    const newObject: Record<string, unknown> = {};
    for (const i in keys) {
      const key = keys[i];
      newObject[key] = sortJson(object[key]);
    }
    return newObject as T;
  }
  return object;
};

const getTemplateFile = async (file: string) => {
  const url = defaultUrl + file;
  const response = await fetch(url);
  const text = await response.text();
  return text;
};

const write = (path: string, text: string) => {
  const pathDir = dirname(path);
  const exists = existsSync(pathDir);
  !exists && mkdirSync(pathDir, { recursive: true });
  writeFileSync(path, text);
};

const run = async () => {
  const requestedPackages = (await checkboxes(
    "Choose",
    packages.map(pkg => ({ name: pkg })),
  )) as Package[];
  const devDependencies: string[] = [];
  const commands: string[] = [];
  const scripts: Record<string, string> = {};
  const tsConfigPath = join(dir, "tsconfig.json");
  let tsConfig = readFileSync(
    join(__dirname, "content/auto/tsconfig.json"),
  ).toString();
  for (const pkg of requestedPackages) {
    if (pkg === "API Extractor") {
      devDependencies.push(
        "@microsoft/api-extractor",
        "@microsoft/api-documenter",
      );
      scripts.docs =
        "npm run build && api-extractor run --local && api-documenter markdown --input-folder temp --output-folder docs/md";
      tsConfig = tsConfig
        .replace('// "declaration": true,', '"declaration": true,   ')
        .replace('// "declarationMap": true,', '"declarationMap": true,   ');
      const apiExtConfigPath = join(dir, "api-extractor.json");
      const apiExtConfigBasePath = join(
        __dirname,
        "content/auto/api-extractor.json",
      );
      const apiExtConfigBase = readFileSync(apiExtConfigBasePath).toString();
      const apiExtConfig = apiExtConfigBase.replace(
        '"mainEntryPointFilePath": "<projectFolder>/',
        '"mainEntryPointFilePath": "',
      );
      write(apiExtConfigPath, apiExtConfig);
    } else if (pkg === "Dotenv") {
      devDependencies.push("dotenv");
      write(join(dir, ".env"), "");
    } else if (pkg === "ESLint") {
      devDependencies.push("eslint", "eslint-plugin-import");
      scripts.lint = 'eslint "." --fix && prettier "." --write';
      const prettierQuestion = getExtensionQuestion(pkg, "Prettier");
      const usePrettier =
        requestedPackages.includes("Prettier") &&
        (await confirm(prettierQuestion, { default: true }));
      const tsQuestion = getExtensionQuestion(pkg, "TypeScript");
      const useTs =
        requestedPackages.includes("TypeScript") &&
        (await confirm(tsQuestion, { default: true }));
      const esLintConfigPath = join(dir, ".eslintrc.json");
      let esLintConfig: EsLintConfig = { ...esLintConfigBase };
      if (usePrettier) {
        esLintConfig = getEsLintConfig(esLintConfig, "Prettier");
        devDependencies.push("prettier", "eslint-plugin-prettier");
      }
      if (useTs) {
        esLintConfig = getEsLintConfig(esLintConfig, "TypeScript");
        devDependencies.push(
          "@typescript-eslint/eslint-plugin",
          "@typescript-eslint/parser",
        );
      }
      const sortedEsLintConfig = sortJson(esLintConfig);
      write(esLintConfigPath, JSON.stringify(sortedEsLintConfig, null, 2));
    } else if (pkg === "Git") {
      const gitIgnoreLines = ["node_modules"];
      requestedPackages.includes("Dotenv") && gitIgnoreLines.push(".env");
      const gitIgnore = gitIgnoreLines.join("\n");
      const gitIgnorePath = join(dir, ".gitignore");
      write(gitIgnorePath, gitIgnore);
    } else if (pkg === "GitHub") {
      const files = [
        ".github/ISSUE_TEMPLATE/bug_report.md",
        ".github/ISSUE_TEMPLATE/feature_request.md",
        ".github/workflows/ci.yml",
        ".github/PULL_REQUEST_TEMPLATE.md",
      ];
      const paths = files.map(file => join(dir, file));
      const texts = await Promise.all(files.map(getTemplateFile));
      for (const i in paths) {
        const path = paths[i];
        const text = texts[i];
        write(path, text);
      }
    } else if (pkg === "Jest") {
      devDependencies.push("jest");
      if (requestedPackages.includes("TypeScript")) {
        devDependencies.push("ts-jest", "@types/jest");
        commands.push("npx ts-jest config:init");
      } else {
        commands.push("npx jest --init");
      }
    } else if (pkg === "Prettier") {
      const prettierConfigPath = join(dir, ".prettierrc");
      const prettierConfig = await getTemplateFile(".prettierrc");
      write(prettierConfigPath, prettierConfig);
    } else if (pkg === "Svelte") {
      
    }
  }
  write(tsConfigPath, tsConfig);
};

run().catch(console.error);
