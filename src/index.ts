import { readFileSync, writeFileSync } from "fs";
import { checkboxes, confirm } from "input";
import { join } from "path";
import esLintConfigBase from "./content/.eslintrc.json";

const dir = join(__dirname, "../output");
const packages = [
  "API Extractor",
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

const getExtensionQuestion = (base: Package, extension: Package) =>
  `Do you want to configure ${base} with ${extension}?`;

type EsLintConfig = typeof esLintConfigBase & {
  parser?: string;
  rules?: { [key: string]: unknown };
};

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

const run = async () => {
  const requestedPackages = (await checkboxes(
    "Choose",
    packages.map(pkg => ({ name: pkg })),
  )) as Package[];
  const devDependencies: string[] = [];
  const scripts: Record<string, string> = {};
  for (const pkg of requestedPackages) {
    if (pkg === "API Extractor") {
      scripts.docs =
        "npm run build && api-extractor run --local && api-documenter markdown --input-folder temp --output-folder docs/md";
      const tsConfigPath = join(dir, "tsconfig.json");
      const tsConfigBasePath = join(__dirname, "content/auto/tsconfig.json");
      const tsConfigBase = readFileSync(tsConfigBasePath).toString();
      const tsConfig = tsConfigBase
        .replace('// "declaration": true,', '"declaration": true,   ')
        .replace('// "declarationMap": true,', '"declarationMap": true,   ');
      writeFileSync(tsConfigPath, tsConfig);
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
      writeFileSync(apiExtConfigPath, apiExtConfig);
    } else if (pkg === "ESLint") {
      devDependencies.push("eslint", "eslint-plugin-import");
      scripts.lint = 'eslint "." --fix && prettier "." --write';
      const prettierQuestion = getExtensionQuestion(pkg, "Prettier");
      const usePrettier = await confirm(prettierQuestion, { default: true });
      const tsQuestion = getExtensionQuestion(pkg, "TypeScript");
      const useTs = await confirm(tsQuestion, { default: true });
      const esLintConfigPath = join(dir, ".eslintrc.json");
      let esLintConfig: EsLintConfig = { ...esLintConfigBase };
      if (usePrettier) {
        esLintConfig = getEsLintConfig(esLintConfig, "Prettier");
        devDependencies.push("prettier", "eslint-plugin-prettier");
      }
      if (useTs) {
        esLintConfig = getEsLintConfig(esLintConfig, "TypeScript");
        devDependencies.push(
          "typescript",
          "@typescript-eslint/eslint-plugin",
          "@typescript-eslint/parser",
        );
      }
      const sortedEsLintConfig = sortJson(esLintConfig);
      writeFileSync(
        esLintConfigPath,
        JSON.stringify(sortedEsLintConfig, null, 2),
      );
    }
  }
};

run().catch(console.error);
