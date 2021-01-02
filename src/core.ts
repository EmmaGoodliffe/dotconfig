import { spawnSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import esLintConfigBase from "./content/.eslintrc.json";
import { getTemplateFile, write } from "./io";
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

type Extends<T, U extends T> = U;

export type Package = typeof packages[number];

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

export default async (
  dir: string,
  inputPackages: Package[] | ((allPackages: Package[]) => Promise<Package[]>),
  confirm: (label: string, defaultAnswer: boolean) => Promise<boolean>,
): Promise<void> => {
  const requestedPackages =
    inputPackages instanceof Array
      ? inputPackages
      : await inputPackages([...packages]);
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
    join(__dirname, "content/auto/tsconfig.json"),
  ).toString();
  const indexJsPath = join(dir, "src/index.js");
  let indexJs = "";
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
        (await confirm(prettierQuestion, true));
      const tsQuestion = getExtensionQuestion(pkg, "TypeScript");
      const useTs =
        requestedPackages.includes("TypeScript") &&
        (await confirm(tsQuestion, true));
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
  const devDependenciesCommand =
    devDependencies.length &&
    `npm i -D ${unique(devDependencies).sort().join(" ")}`;
  devDependenciesCommand && commands.push(devDependenciesCommand);
  for (const command of commands) {
    const words = command.split(" ");
    const main = words[0];
    const args = words.slice(1);
    const output = spawnSync(main, args, { cwd: dir });
    const { stdout, stderr } = output;
    console.log({ output });
    if (stderr.toString()) {
      throw new Error(`Error running ${command}: ${stderr}`);
    }
    const result = stdout.toString();
    console.log({ result });
  }
};