#! /usr/bin/env node
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var _eslintrc_json_1 = __importDefault(require("./content/.eslintrc.json"));
var io_1 = require("./io");
var util_1 = require("./util");
var packages = [
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
];
var autoTemplateDir = path_1.join(__dirname, "../bin/content/auto");
var isPackage = function (pkg) {
    return packages.includes(pkg);
};
var getExtensionQuestion = function (base, extension) {
    return "Do you want to configure " + base + " with " + extension + "?";
};
var extendEsLintConfig = function (base, extension) {
    if (extension === "Prettier") {
        return __assign(__assign({}, base), { plugins: __spreadArrays(base.plugins, ["prettier"]), rules: __assign(__assign({}, base.rules), { "prettier/prettier": "error" }) });
    }
    else if (extension === "TypeScript") {
        return __assign(__assign({}, base), { extends: __spreadArrays(base.extends, [
                "plugin:@typescript-eslint/recommended",
                "plugin:import/typescript",
            ]), parser: "@typescript-eslint/parser", plugins: __spreadArrays(base.plugins, ["@typescript-eslint"]), rules: __assign(__assign({}, base.rules), { "@typescript-eslint/no-empty-function": [
                    "error",
                    { allow: ["arrowFunctions"] },
                ] }) });
    }
    return base;
};
exports.default = (function (dir, options) { return __awaiter(void 0, void 0, void 0, function () {
    var ui, autoInstall, confirm, inputPackages, onCommandError, requestedPackages, packageJsonPath, packageJsonExists, devDependencies, commands, scripts, tsConfigPath, tsConfig, indexJsPath, indexJs, _i, requestedPackages_1, pkg, prettierQuestion, usePrettier, _a, tsQuestion, useTs, _b, esLintConfigPath, esLintConfig, sortedEsLintConfig, gitIgnoreLines, gitIgnore, gitIgnorePath, files, paths, texts, i, path, text, indexTestTsPath, indexTestJsPath, prettierConfigPath, prettierConfig, rollupConfigPath, rollupConfig, tsSveltePath, tsSvelte, tailwindConfigPath, tailwindConfig, question, indexCss, indexScssPath, indexScss, indexCssPath, tsPath, buildScript, devScript, _c, _d, script, packageJsonBase, allScripts, packageJson, finalDevDependencies, shouldInstall, _e, commands_1, command, err_1;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                ui = options.ui, autoInstall = options.autoInstall;
                confirm = ui.confirm, inputPackages = ui.inputPackages, onCommandError = ui.onCommandError;
                return [4 /*yield*/, inputPackages(__spreadArrays(packages))];
            case 1:
                requestedPackages = _f.sent();
                packageJsonPath = path_1.join(dir, "package.json");
                packageJsonExists = fs_1.existsSync(dir) && fs_1.existsSync(packageJsonPath);
                if (!packageJsonExists) {
                    throw new Error("Expected " + packageJsonPath + " to exist");
                }
                devDependencies = [];
                commands = [];
                scripts = {};
                tsConfigPath = path_1.join(dir, "tsconfig.json");
                tsConfig = fs_1.readFileSync(path_1.join(autoTemplateDir, "tsconfig.json")).toString();
                indexJsPath = path_1.join(dir, "src/index.js");
                indexJs = "";
                _i = 0, requestedPackages_1 = requestedPackages;
                _f.label = 2;
            case 2:
                if (!(_i < requestedPackages_1.length)) return [3 /*break*/, 25];
                pkg = requestedPackages_1[_i];
                if (!isPackage(pkg)) {
                    throw new Error("Expected a valid package. Received: " + pkg);
                }
                if (!(pkg === "API Extractor")) return [3 /*break*/, 3];
                if (!requestedPackages.includes("TypeScript")) {
                    throw new Error("API Extractor can only be used with TypeScript");
                }
                devDependencies.push("@microsoft/api-extractor", "@microsoft/api-documenter");
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
                commands.push("npx @microsoft/api-extractor init");
                return [3 /*break*/, 24];
            case 3:
                if (!(pkg === "Dotenv")) return [3 /*break*/, 4];
                devDependencies.push("dotenv");
                io_1.write(path_1.join(dir, ".env"), "");
                return [3 /*break*/, 24];
            case 4:
                if (!(pkg === "ESLint")) return [3 /*break*/, 9];
                devDependencies.push("eslint", "eslint-plugin-import");
                scripts.lint = 'eslint "." --fix';
                prettierQuestion = getExtensionQuestion(pkg, "Prettier");
                _a = requestedPackages.includes("Prettier");
                if (!_a) return [3 /*break*/, 6];
                return [4 /*yield*/, confirm(prettierQuestion, true)];
            case 5:
                _a = (_f.sent());
                _f.label = 6;
            case 6:
                usePrettier = _a;
                tsQuestion = getExtensionQuestion(pkg, "TypeScript");
                _b = requestedPackages.includes("TypeScript");
                if (!_b) return [3 /*break*/, 8];
                return [4 /*yield*/, confirm(tsQuestion, true)];
            case 7:
                _b = (_f.sent());
                _f.label = 8;
            case 8:
                useTs = _b;
                esLintConfigPath = path_1.join(dir, ".eslintrc.json");
                esLintConfig = __assign({}, _eslintrc_json_1.default);
                if (usePrettier) {
                    scripts.lint += ' && prettier "." --write';
                    esLintConfig = extendEsLintConfig(esLintConfig, "Prettier");
                    devDependencies.push("prettier", "eslint-plugin-prettier");
                }
                if (useTs) {
                    esLintConfig = extendEsLintConfig(esLintConfig, "TypeScript");
                    devDependencies.push("@typescript-eslint/eslint-plugin", "@typescript-eslint/parser");
                }
                sortedEsLintConfig = util_1.sortJson(esLintConfig);
                io_1.write(esLintConfigPath, JSON.stringify(sortedEsLintConfig, null, 2));
                return [3 /*break*/, 24];
            case 9:
                if (!(pkg === "Git")) return [3 /*break*/, 10];
                gitIgnoreLines = ["node_modules"];
                requestedPackages.includes("Dotenv") && gitIgnoreLines.push(".env");
                gitIgnore = gitIgnoreLines.join("\n");
                gitIgnorePath = path_1.join(dir, ".gitignore");
                io_1.write(gitIgnorePath, gitIgnore);
                return [3 /*break*/, 24];
            case 10:
                if (!(pkg === "GitHub")) return [3 /*break*/, 12];
                files = [
                    ".github/ISSUE_TEMPLATE/bug_report.md",
                    ".github/ISSUE_TEMPLATE/feature_request.md",
                    ".github/workflows/ci.yml",
                    ".github/PULL_REQUEST_TEMPLATE.md",
                ];
                paths = files.map(function (file) { return path_1.join(dir, file); });
                return [4 /*yield*/, Promise.all(files.map(io_1.getTemplateFile))];
            case 11:
                texts = _f.sent();
                for (i in paths) {
                    path = paths[i];
                    text = texts[i];
                    io_1.write(path, text);
                }
                return [3 /*break*/, 24];
            case 12:
                if (!(pkg === "Jest")) return [3 /*break*/, 13];
                devDependencies.push("jest");
                scripts.test = "jest";
                if (requestedPackages.includes("TypeScript")) {
                    devDependencies.push("ts-jest", "@types/jest");
                    indexTestTsPath = path_1.join(dir, "src/index.test.ts");
                    io_1.write(indexTestTsPath, "");
                    commands.push("npx ts-jest config:init");
                }
                else {
                    indexTestJsPath = path_1.join(dir, "src/index.test.js");
                    io_1.write(indexTestJsPath, "");
                    commands.push("npx jest --init");
                }
                return [3 /*break*/, 24];
            case 13:
                if (!(pkg === "Prettier")) return [3 /*break*/, 15];
                if (!requestedPackages.includes("ESLint")) {
                    scripts.lint = 'prettier "." --write';
                }
                prettierConfigPath = path_1.join(dir, ".prettierrc");
                return [4 /*yield*/, io_1.getTemplateFile(".prettierrc")];
            case 14:
                prettierConfig = _f.sent();
                io_1.write(prettierConfigPath, prettierConfig);
                return [3 /*break*/, 24];
            case 15:
                if (!(pkg === "SCSS")) return [3 /*break*/, 16];
                devDependencies.push("sass");
                if (!requestedPackages.includes("Tailwind")) {
                    scripts["build:scss"] = "sass src/index.scss dist/index.css";
                }
                return [3 /*break*/, 24];
            case 16:
                if (!(pkg === "Svelte")) return [3 /*break*/, 21];
                scripts["build:svelte"] = "rollup -c";
                scripts["dev:svelte"] = "rollup -c -w";
                rollupConfigPath = path_1.join(dir, "rollup.config.js");
                return [4 /*yield*/, io_1.getTemplateFile("rollup.config.js")];
            case 17:
                rollupConfig = _f.sent();
                io_1.write(rollupConfigPath, rollupConfig);
                if (!requestedPackages.includes("TypeScript")) return [3 /*break*/, 19];
                tsSveltePath = path_1.join(dir, "scripts/tsSvelte.js");
                return [4 /*yield*/, io_1.getTemplateFile("scripts/tsSvelte.js")];
            case 18:
                tsSvelte = _f.sent();
                commands.push("node scripts/tsSvelte.js");
                io_1.write(tsSveltePath, tsSvelte);
                return [3 /*break*/, 20];
            case 19:
                devDependencies.push("@rollup/plugin-commonjs@^16.0.0", "@rollup/plugin-node-resolve@^10.0.0", "rollup@^2.3.4", "rollup-plugin-css-only@^3.1.0", "rollup-plugin-livereload@^2.0.0", "rollup-plugin-svelte@^7.0.0", "rollup-plugin-terser@^7.0.0", "svelte@^3.0.0");
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
                _f.label = 20;
            case 20: return [3 /*break*/, 24];
            case 21:
                if (!(pkg === "Tailwind")) return [3 /*break*/, 23];
                devDependencies.push("tailwindcss");
                tailwindConfigPath = path_1.join(dir, "tailwind.config.js");
                tailwindConfig = [
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
                io_1.write(tailwindConfigPath, tailwindConfig);
                question = "Would you like to use custom CSS with Tailwind?";
                return [4 /*yield*/, confirm(question, true)];
            case 22:
                if (_f.sent()) {
                    devDependencies.push("tailwindcss-cli");
                    indexCss = [
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
                        indexScssPath = path_1.join(dir, "src/index.scss");
                        indexScss = indexCss;
                        io_1.write(indexScssPath, indexScss);
                    }
                    else {
                        scripts["build:css"] =
                            "tailwindcss-cli build src/index.css -o dist/index.css";
                        indexCssPath = path_1.join(dir, "src/index.css");
                        io_1.write(indexCssPath, indexCss);
                    }
                }
                else {
                    commands.push("npx tailwindcss-cli@latest build -o src/tailwind.css");
                }
                return [3 /*break*/, 24];
            case 23:
                if (pkg === "TypeScript") {
                    devDependencies.push("tsc");
                    scripts["build:ts"] = "tsc";
                    tsPath = path_1.join(dir, "src/index.ts");
                    io_1.write(tsPath, "");
                }
                _f.label = 24;
            case 24:
                _i++;
                return [3 /*break*/, 2];
            case 25:
                if (requestedPackages.includes("TypeScript")) {
                    io_1.write(tsConfigPath, tsConfig);
                }
                else {
                    io_1.write(indexJsPath, indexJs);
                }
                buildScript = "";
                devScript = "";
                for (_c = 0, _d = Object.keys(scripts).sort(); _c < _d.length; _c++) {
                    script = _d[_c];
                    if (script.includes("build:")) {
                        buildScript += " && npm run " + script;
                    }
                    if (script.includes("dev:")) {
                        devScript += " && npm run " + script;
                    }
                }
                scripts.build = buildScript.slice(" && ".length);
                scripts.dev = devScript.slice(" && ".length);
                packageJsonBase = JSON.parse(fs_1.readFileSync(packageJsonPath).toString());
                allScripts = __assign(__assign({}, packageJsonBase.scripts), scripts);
                packageJson = __assign(__assign({}, packageJsonBase), { scripts: util_1.sortJson(allScripts) });
                io_1.write(packageJsonPath, JSON.stringify(packageJson, null, 2));
                finalDevDependencies = util_1.unique(devDependencies).sort();
                shouldInstall = (autoInstall === false ? false : true) && devDependencies.length;
                shouldInstall && commands.push("npm i -D " + finalDevDependencies.join(" "));
                _e = 0, commands_1 = commands;
                _f.label = 26;
            case 26:
                if (!(_e < commands_1.length)) return [3 /*break*/, 32];
                command = commands_1[_e];
                _f.label = 27;
            case 27:
                _f.trys.push([27, 29, , 31]);
                return [4 /*yield*/, io_1.runCommand(command, dir)];
            case 28:
                _f.sent();
                return [3 /*break*/, 31];
            case 29:
                err_1 = _f.sent();
                return [4 /*yield*/, onCommandError(command, err_1)];
            case 30:
                _f.sent();
                return [3 /*break*/, 31];
            case 31:
                _e++;
                return [3 /*break*/, 26];
            case 32: return [2 /*return*/, finalDevDependencies];
        }
    });
}); });
