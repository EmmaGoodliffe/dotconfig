import { existsSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";
import esLintConfigBase from "./content/.eslintrc.json";
import { getTemplateFile, runCommand, write } from "./io";
import { deleteProperty, sortJson, unique } from "./util";

const packages = {
  front: ["SCSS", "Svelte", "Tailwind"],
  back: ["API Extractor"],
  both: [
    "Dotenv",
    "ESLint",
    "Firebase",
    "Git",
    "GitHub",
    "Jest",
    "Prettier",
    "TypeScript",
  ],
} as const;
const allPackages = [
  ...packages.front,
  ...packages.back,
  ...packages.both,
] as const;

type PossiblePromise<T> = T | Promise<T>;

type Package = typeof allPackages[number];
type End = keyof typeof packages;

type EsLintConfig = typeof esLintConfigBase & {
  parser?: string;
  rules?: Record<string, unknown>;
};

interface Ui {
  confirm: (label: string, defaultAnswer: boolean) => PossiblePromise<boolean>;
  inputEnd: () => PossiblePromise<End>;
  inputPackages: (allPackages: Package[]) => PossiblePromise<Package[]>;
  log: (message: string) => PossiblePromise<void>;
  onCommandError: (command: string, err: string) => PossiblePromise<void>;
}

export interface Options {
  ui: Ui;
  testing?: boolean;
}

const isPackage = (pkg: string): pkg is Package =>
  allPackages.includes(pkg as Package);

const getExtensionQuestion = (base: Package, extension: Package) =>
  `Would you like to configure ${base} with ${extension}?`;

const extendEsLintConfig = (
  base: EsLintConfig,
  extension: Extract<Package, "Prettier" | "TypeScript">,
) => {
  if (extension === "Prettier") {
    return {
      ...base,
      plugins: [...base.plugins, "prettier"],
      rules: { ...base.rules, "prettier/prettier": "error" },
    };
  }
  if (extension === "TypeScript") {
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

export default async (dir: string, options: Options) => {
  const { ui, testing } = options;
  const { confirm, inputEnd, inputPackages, log, onCommandError } = ui;
  const runLocalCommand = (command: string) =>
    runCommand(command, dir, log, onCommandError);
  const end = await inputEnd();
  const packageChoices =
    end === "both" ? allPackages : [...packages.both, ...packages[end]];
  const requestedPackages = await inputPackages([...packageChoices].sort());
  const packageJsonPath = join(dir, "package.json");
  const packageJsonExists = existsSync(dir) && existsSync(packageJsonPath);
  !packageJsonExists &&
    (await confirm("Would you like to create a package.json file?", true)) &&
    (await runLocalCommand("npm init"));
  if (requestedPackages.includes("TypeScript")) {
    await runLocalCommand("npx tsc --init");
  }
  mkdirSync(join(dir, "src"));
  const dependencies: string[] = [];
  const devDependencies: string[] = [];
  const scripts: Record<string, string> = { lint: "" };
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
      const tsConfigPath = join(dir, "tsconfig.json");
      const tsConfig = readFileSync(tsConfigPath)
        .toString()
        .replace('// "declaration":', '"declaration":')
        .replace('// "declarationMap":', '"declarationMap":');
      write(tsConfigPath, tsConfig);
      await runLocalCommand("npx @microsoft/api-extractor init");
      const apiExtConfigPath = join(dir, "api-extractor.json");
      const apiExtConfigBase = readFileSync(apiExtConfigPath).toString();
      const apiExtConfig = apiExtConfigBase.replace(
        '"mainEntryPointFilePath": "<projectFolder>/lib',
        '"mainEntryPointFilePath": ".',
      );
      write(apiExtConfigPath, apiExtConfig);
    } else if (pkg === "Dotenv") {
      devDependencies.push("dotenv");
      write(join(dir, ".env"), "");
    } else if (pkg === "ESLint") {
      devDependencies.push("eslint", "eslint-plugin-import");
      scripts.lint += ' && eslint "." --fix';
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
        esLintConfig = extendEsLintConfig(esLintConfig, "Prettier");
        devDependencies.push("eslint-plugin-prettier");
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
    } else if (pkg === "Firebase") {
      dependencies.push("firebase");
      await runLocalCommand("npx firebase-tools init");
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
        const indexTestTs = requestedPackages.includes("Svelte")
          ? "export {}"
          : "";
        write(indexTestTsPath, indexTestTs);
        await runLocalCommand("npx ts-jest config:init");
      } else {
        const indexTestJsPath = join(dir, "src/index.test.js");
        write(indexTestJsPath, "");
        await runLocalCommand("npx jest --init");
      }
    } else if (pkg === "Prettier") {
      devDependencies.push("prettier");
      scripts.lint += ' && prettier "." --write';
      const prettierConfigPath = join(dir, ".prettierrc");
      const prettierConfig = await getTemplateFile(".prettierrc");
      write(prettierConfigPath, prettierConfig);
    } else if (pkg === "SCSS") {
      devDependencies.push("sass");
      if (!requestedPackages.includes("Tailwind")) {
        scripts["build:scss"] = "sass src/index.scss public/index.css";
        const indexScssPath = join(dir, "src/index.scss");
        write(indexScssPath, "");
      }
    } else if (pkg === "Svelte") {
      scripts["build:svelte"] = "rollup -c";
      scripts["dev:svelte"] = "rollup -c -w";
      scripts.lint += " && svelte-check";
      const rollupConfigPath = join(dir, "rollup.config.js");
      const rollupConfig = await getTemplateFile("rollup.config.js");
      write(rollupConfigPath, rollupConfig);
      scripts.start = 'echo \\"No start script yet\\"';
      if (requestedPackages.includes("TypeScript")) {
        const tsSveltePath = join(dir, "scripts/tsSvelte.js");
        const tsSvelte = await getTemplateFile("scripts/tsSvelte.js");
        devDependencies.push("@tsconfig/svelte");
        write(tsSveltePath, tsSvelte);
        await runLocalCommand("node scripts/tsSvelte.js");
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
        const indexJsPath = join(dir, "src/index.js");
        const indexJs = [
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
        if (!requestedPackages.includes("TypeScript")) {
          write(indexJsPath, indexJs);
        }
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
            "sass src/index.scss temp/index.css && tailwindcss-cli build temp/index.css -o public/index.css";
          const indexScssPath = join(dir, "src/index.scss");
          const indexScss = indexCss;
          write(indexScssPath, indexScss);
        } else {
          scripts["build:css"] =
            "tailwindcss-cli build src/index.css -o public/index.css";
          const indexCssPath = join(dir, "src/index.css");
          write(indexCssPath, indexCss);
        }
      } else {
        await runLocalCommand(
          "npx tailwindcss-cli@latest build -o src/tailwind.css",
        );
      }
    } else if (pkg === "TypeScript") {
      devDependencies.push("typescript");
      scripts["build:ts"] = "tsc";
      const indexTsPath = join(dir, "src/index.ts");
      const svelteTs = "export {}";
      const firebaseTs = [
        'import firebase from "firebase/app";',
        "",
        "firebase.initializeApp({/* ... */});",
      ].join("\n");
      const indexTs = requestedPackages.includes("Firebase")
        ? firebaseTs
        : requestedPackages.includes("Svelte")
        ? svelteTs
        : "";
      write(indexTsPath, indexTs);
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
  scripts.build = buildScript.slice(" && ".length);
  scripts.dev = devScript.slice(" && ".length);
  scripts.lint = scripts.lint.slice(" && ".length);
  const packageJsonBase = JSON.parse(readFileSync(packageJsonPath).toString());
  const allScripts = deleteProperty(
    { ...packageJsonBase.scripts, ...scripts },
    "validate",
  );
  const packageJson = {
    ...packageJsonBase,
    scripts: sortJson(allScripts),
  };
  write(packageJsonPath, JSON.stringify(packageJson, null, 2));
  const finalDependencies = unique(dependencies).sort();
  const finalDevDependencies = unique(devDependencies).sort();
  const shouldInstall =
    !testing &&
    (await confirm("Would you like to install NPM dependencies now?", true));
  const installCommand = `npm i ${finalDependencies.join(" ")}`;
  const installDevCommand = `npm i -D ${finalDevDependencies.join(" ")}`;
  if (shouldInstall) {
    await runLocalCommand(installCommand);
    await runLocalCommand(installDevCommand);
  }
  return {
    dependencies: finalDependencies,
    devDependencies: finalDevDependencies,
  };
};
