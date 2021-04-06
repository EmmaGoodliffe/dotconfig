import { existsSync, readFileSync } from "fs";
import { join } from "path";
import esLintConfigBase from "./content/.eslintrc.json";
import { getTemplateFile, runCommand, write } from "./io";
import { sortJson, unique } from "./util";

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
const autoTemplateDir = join(__dirname, "../bin/content/auto");

type Extends<T, U extends T> = U;

type PossiblePromise<T> = T | Promise<T>;

type Package = typeof packages[number];

type EsLintConfig = typeof esLintConfigBase & {
  parser?: string;
  rules?: Record<string, unknown>;
};

interface Ui {
  confirm: (label: string, defaultAnswer: boolean) => PossiblePromise<boolean>;
  inputPackages: (allPackages: Package[]) => PossiblePromise<Package[]>;
  onCommandError: (command: string, err: string) => PossiblePromise<void>;
}

interface Options {
  ui: Ui;
  autoInstall?: boolean;
}

const isPackage = (pkg: unknown): pkg is Package =>
  packages.includes(pkg as Package);

const getExtensionQuestion = (base: Package, extension: Package) =>
  `Do you want to configure ${base} with ${extension}?`;

const extendEsLintConfig = (
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

export default async (dir: string, options: Options): Promise<string[]> => {
  const { ui, autoInstall } = options;
  const { confirm, inputPackages, onCommandError } = ui;
  const requestedPackages = await inputPackages([...packages]);
  const packageJsonPath = join(dir, "package.json");
  const packageJsonExists = existsSync(dir) && existsSync(packageJsonPath);
  if (!packageJsonExists) {
    throw new Error(`Expected ${packageJsonPath} to exist`);
  }
  const devDependencies: string[] = [];
  const commands: string[] = [];
  const scripts: Record<string, string> = {};
  const tsConfigPath = join(dir, "tsconfig.json");
  let tsConfig = readFileSync(
    join(autoTemplateDir, "tsconfig.json"),
  ).toString();
  const indexJsPath = join(dir, "src/index.js");
  let indexJs = "";
  for (const pkg of requestedPackages) {
    if (!isPackage(pkg)) {
      throw new Error(`Expected a valid package. Received: ${pkg}`);
    }
    if (pkg === "API Extractor") {
      if (!requestedPackages.includes("TypeScript")) {
        throw new Error("API Extractor can only be used with TypeScript");
      }
      devDependencies.push(
        "@microsoft/api-extractor",
        "@microsoft/api-documenter",
      );
      scripts.docs =
        "npm run build && api-extractor run --local && api-documenter markdown --input-folder temp --output-folder docs/md";
      tsConfig = tsConfig
        .replace('// "declaration":', '"declaration":')
        .replace('// "declarationMap":', '"declarationMap":');
      // const apiExtConfigPath = join(dir, "api-extractor.json");
      // const apiExtConfigBasePath = join(autoTemplateDir, "api-extractor.json");
      // const apiExtConfigBase = readFileSync(apiExtConfigBasePath).toString();
      // const apiExtConfig = apiExtConfigBase.replace(
      //   '"mainEntryPointFilePath": "<projectFolder>/',
      //   '"mainEntryPointFilePath": "',
      // );
      // write(apiExtConfigPath, apiExtConfig);
      commands.push("npx api-extractor init");
    } else if (pkg === "Dotenv") {
      devDependencies.push("dotenv");
      write(join(dir, ".env"), "");
    } else if (pkg === "ESLint") {
      devDependencies.push("eslint", "eslint-plugin-import");
      scripts.lint = 'eslint "." --fix';
      const prettierQuestion = getExtensionQuestion(pkg, "Prettier");
      const usePrettier =
        requestedPackages.includes("Prettier") &&
        (await confirm(prettierQuestion, true));
      const tsQuestion = getExtensionQuestion(pkg, "TypeScript");
      const useTs =
        requestedPackages.includes("TypeScript") &&
        (await confirm(tsQuestion, true));
      const esLintConfigPath = join(dir, ".eslintrc.json");
      let esLintConfig: EsLintConfig = { ...esLintConfigBase };
      if (usePrettier) {
        scripts.lint += ' && prettier "." --write';
        esLintConfig = extendEsLintConfig(esLintConfig, "Prettier");
        devDependencies.push("prettier", "eslint-plugin-prettier");
      }
      if (useTs) {
        esLintConfig = extendEsLintConfig(esLintConfig, "TypeScript");
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
        const indexTestTsPath = join(dir, "src/index.test.ts");
        write(indexTestTsPath, "");
        commands.push("npx ts-jest config:init");
      } else {
        const indexTestJsPath = join(dir, "src/index.test.js");
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
        indexJs = [
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
      const question = "Would you like to use custom CSS with Tailwind?";
      if (await confirm(question, true)) {
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
      devDependencies.push("tsc");
      scripts["build:ts"] = "tsc";
      const tsPath = join(dir, "src/index.ts");
      write(tsPath, "");
    }
  }
  if (requestedPackages.includes("TypeScript")) {
    write(tsConfigPath, tsConfig);
  } else {
    write(indexJsPath, indexJs);
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
  scripts.build = buildScript.slice(" && ".length);
  scripts.dev = devScript.slice(" && ".length);
  const packageJsonBase = JSON.parse(readFileSync(packageJsonPath).toString());
  const allScripts = { ...packageJsonBase.scripts, ...scripts };
  const packageJson = {
    ...packageJsonBase,
    scripts: sortJson(allScripts),
  };
  write(packageJsonPath, JSON.stringify(packageJson, null, 2));
  const finalDevDependencies = unique(devDependencies).sort();
  const shouldInstall =
    (autoInstall === false ? false : true) && devDependencies.length;
  shouldInstall && commands.push(`npm i -D ${finalDevDependencies.join(" ")}`);
  for (const command of commands) {
    try {
      await runCommand(command, dir);
    } catch (err) {
      await onCommandError(command, err);
    }
  }
  return finalDevDependencies;
};
