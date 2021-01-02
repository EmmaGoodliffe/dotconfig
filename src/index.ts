import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { checkboxes, confirm } from "input";
import fetch from "node-fetch";
import { dirname, join } from "path";
import esLintConfigBase from "./content/.eslintrc.json";

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
  "SCSS",
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

const sort = <T extends Record<string, unknown>>(obj: T) => {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    result[key] = obj[key];
  }
  return result as T;
};

const unique = <T>(arr: T[]) => Array.from(new Set(arr));

const run = async (dir: string) => {
  const packageJsonPath = join(dir, "package.json");
  const packageJsonExists = existsSync(dir) && existsSync(packageJsonPath);
  if (!packageJsonExists) {
    throw `Expected ${packageJsonPath} to exist`;
  }
  const choices = packages.map(pkg => ({ name: pkg }));
  const requestedPackages = (await checkboxes(
    "Which packages would you like to configure?",
    [...choices, { name: "---", disabled: true }],
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
      scripts.test = "jest";
      if (requestedPackages.includes("TypeScript")) {
        devDependencies.push("ts-jest", "@types/jest");
        const indexTestTsPath = join(dir, "index.test.ts");
        write(indexTestTsPath, "");
        commands.push("npx ts-jest config:init");
      } else {
        const indexTestJsPath = join(dir, "index.test.js");
        write(indexTestJsPath, "");
        commands.push("npx jest --init");
      }
    } else if (pkg === "Prettier") {
      if (!requestedPackages.includes("ESLint")) {
        scripts.lint = 'prettier "." --write';
      }
      const prettierConfigPath = join(dir, ".prettierrc");
      const prettierConfig = await getTemplateFile(".prettierrc");
      write(prettierConfigPath, prettierConfig);
    } else if (pkg === "SCSS") {
      devDependencies.push("sass");
      if (!requestedPackages.includes("Tailwind")) {
        scripts["build:scss"] = "sass src/index.scss dist/index.css";
      }
    } else if (pkg === "Svelte") {
      scripts["build:svelte"] = "rollup -c";
      scripts["dev:svelte"] = "rollup -c -w";
      const rollupConfigPath = join(dir, "rollup.config.js");
      const rollupConfig = await getTemplateFile("rollup.config.js");
      write(rollupConfigPath, rollupConfig);
      if (requestedPackages.includes("TypeScript")) {
        const tsSveltePath = join(dir, "scripts/tsSvelte.js");
        const tsSvelte = await getTemplateFile("scripts/tsSvelte.js");
        commands.push("node scripts/tsSvelte.js");
        write(tsSveltePath, tsSvelte);
      } else {
        devDependencies.push(
          "@rollup/plugin-commonjs@^16.0.0",
          "@rollup/plugin-node-resolve@^10.0.0",
          "rollup@^2.3.4",
          "rollup-plugin-css-only@^3.1.0",
          "rollup-plugin-livereload@^2.0.0",
          "rollup-plugin-svelte@^7.0.0",
          "rollup-plugin-terser@^7.0.0",
          "svelte@^3.0.0",
        );
        const mainJsPath = join(dir, "src/main.js");
        const mainJs = [
          'import App from "./App.svelte";',
          "",
          "const app = new App({",
          "  target: document.body,",
          "    props: {",
          '      name: "world"',
          "    }",
          "});",
          "",
          "export default app;",
        ].join("\n");
        write(mainJsPath, mainJs);
      }
    } else if (pkg === "Tailwind") {
      devDependencies.push("tailwindcss");
      const tailwindConfigPath = join(dir, "tailwind.config.js");
      const tailwindConfig = [
        'const colors = require("tailwindcss/colors");',
        "",
        "module.exports = {",
        "  theme: {",
        "    extend: {",
        "      colors: {",
        "        cyan: colors.cyan,",
        "      },",
        "    },",
        "  },",
        "  variants: {},",
        "  plugins: [],",
        "}",
      ].join("\n");
      write(tailwindConfigPath, tailwindConfig);
      if (await confirm("Would you like to use custom CSS with Tailwind?")) {
        devDependencies.push("tailwindcss-cli");
        const indexCss = [
          "@tailwind base;",
          "@tailwind components;",
          "@tailwind utilities;",
          "",
          ".btn {",
          "  @apply px-4 py-2 bg-cyan-500 text-white rounded font-bold;",
          "}",
        ].join("\n");
        if (requestedPackages.includes("SCSS")) {
          scripts["build:scss"] =
            "sass src/index.scss src/index.css && tailwindcss-cli build src/index.css -o dist/index.css";
          const indexScssPath = join(dir, "src/index.scss");
          const indexScss = indexCss;
          write(indexScssPath, indexScss);
        } else {
          scripts["build:css"] =
            "tailwindcss-cli build src/index.css -o dist/index.css";
          const indexCssPath = join(dir, "src/index.css");
          write(indexCssPath, indexCss);
        }
      } else {
        commands.push("npx tailwindcss-cli@latest build -o src/tailwind.css");
      }
    } else if (pkg === "TypeScript") {
      scripts["build:ts"] = "tsc";
      write(tsConfigPath, tsConfig);
    }
  }
  let buildScript = "";
  let devScript = "";
  for (const script of Object.keys(scripts).sort()) {
    if (script.includes("build:")) {
      buildScript += ` && npm run ${script}`;
    }
    if (script.includes("dev:")) {
      devScript += ` && npm run ${script}`;
    }
  }
  buildScript = buildScript.slice(" && ".length);
  devScript = devScript.slice(" && ".length);
  scripts.build = buildScript;
  scripts.dev = devScript;
  const packageJsonBase = JSON.parse(readFileSync(packageJsonPath).toString());
  const packageJson = {
    ...packageJsonBase,
    scripts: { ...packageJsonBase.scripts, ...sort(scripts) },
  };
  write(packageJsonPath, JSON.stringify(packageJson, null, 2));
  commands.push(`npm i -D ${unique(devDependencies).sort().join(" ")}`);
  console.log({ commands });
};

const dir = join(__dirname, "../output");
run(dir).catch(console.error);
