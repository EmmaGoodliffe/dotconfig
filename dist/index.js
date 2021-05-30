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
var packages = {
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
};
var allPackages = __spreadArrays(packages.front, packages.back, packages.both);
var isPackage = function (pkg) {
    return allPackages.includes(pkg);
};
var getExtensionQuestion = function (base, extension) {
    return "Would you like to configure " + base + " with " + extension + "?";
};
var extendEsLintConfig = function (base, extension) {
    if (extension === "Prettier") {
        return __assign(__assign({}, base), { plugins: __spreadArrays(base.plugins, ["prettier"]), rules: __assign(__assign({}, base.rules), { "prettier/prettier": "error" }) });
    }
    if (extension === "TypeScript") {
        return __assign(__assign({}, base), { extends: __spreadArrays(base.extends, [
                "plugin:@typescript-eslint/recommended",
                "plugin:import/typescript",
            ]), parser: "@typescript-eslint/parser", parserOptions: __assign(__assign({}, base.parserOptions), { project: "tsconfig.json" }), plugins: __spreadArrays(base.plugins, ["@typescript-eslint", "ts-exports"]), rules: __assign(__assign({}, base.rules), { "@typescript-eslint/explicit-module-boundary-types": "off", "@typescript-eslint/no-empty-function": [
                    "error",
                    { allow: ["arrowFunctions"] },
                ], "ts-exports/unused-exports": "error" }) });
    }
    return base;
};
exports.default = (function (dir, options) { return __awaiter(void 0, void 0, void 0, function () {
    var ui, testing, confirm, inputEnd, inputPackages, log, onCommandError, runLocalCommand, end, packageChoices, requestedPackages, packageJsonPath, packageJsonExists, _a, dependencies, devDependencies, scripts, _i, requestedPackages_1, pkg, tsConfigPath, tsConfig, apiExtConfigPath, apiExtConfigBase, apiExtConfig, prettierQuestion, usePrettier, _b, tsQuestion, useTs, _c, esLintConfigPath, esLintConfig, sortedEsLintConfig, gitIgnoreLines, gitIgnore, gitIgnorePath, files, paths, texts, i, path, text, indexTestTsPath, indexTestTs, indexTestJsPath, prettierConfigPath, prettierConfig, indexScssPath, rollupConfigPath, rollupConfig, tsSveltePath, tsSvelte, indexJsPath, indexJs, question, tailwindConfigPath, tailwindConfig, indexCss, indexScssPath, indexScss, indexCssPath, indexTsPath, svelteTs, firebaseTs, indexTs, buildScript, devScript, _d, _e, script, packageJsonBase, allScripts, packageJson, finalDependencies, finalDevDependencies, shouldInstall, _f, installCommand, installDevCommand;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                ui = options.ui, testing = options.testing;
                confirm = ui.confirm, inputEnd = ui.inputEnd, inputPackages = ui.inputPackages, log = ui.log, onCommandError = ui.onCommandError;
                runLocalCommand = function (command) {
                    return io_1.runCommand(command, dir, log, onCommandError);
                };
                return [4 /*yield*/, inputEnd()];
            case 1:
                end = _g.sent();
                packageChoices = end === "both" ? allPackages : __spreadArrays(packages.both, packages[end]);
                return [4 /*yield*/, inputPackages(__spreadArrays(packageChoices).sort())];
            case 2:
                requestedPackages = _g.sent();
                packageJsonPath = path_1.join(dir, "package.json");
                packageJsonExists = fs_1.existsSync(dir) && fs_1.existsSync(packageJsonPath);
                _a = !packageJsonExists;
                if (!_a) return [3 /*break*/, 4];
                return [4 /*yield*/, runLocalCommand("npm init")];
            case 3:
                _a = (_g.sent());
                _g.label = 4;
            case 4:
                _a;
                if (!requestedPackages.includes("TypeScript")) return [3 /*break*/, 6];
                return [4 /*yield*/, runLocalCommand("npx tsc --init")];
            case 5:
                _g.sent();
                _g.label = 6;
            case 6:
                fs_1.mkdirSync(path_1.join(dir, "src"));
                dependencies = [];
                devDependencies = [];
                scripts = { lint: "" };
                _i = 0, requestedPackages_1 = requestedPackages;
                _g.label = 7;
            case 7:
                if (!(_i < requestedPackages_1.length)) return [3 /*break*/, 41];
                pkg = requestedPackages_1[_i];
                if (!isPackage(pkg)) {
                    throw new Error("Expected a valid package. Received: " + pkg);
                }
                if (!(pkg === "API Extractor")) return [3 /*break*/, 9];
                if (!requestedPackages.includes("TypeScript")) {
                    throw new Error("API Extractor can only be used with TypeScript");
                }
                devDependencies.push("@microsoft/api-extractor", "@microsoft/api-documenter");
                scripts.docs =
                    "npm run build && api-extractor run --local && api-documenter markdown --input-folder temp --output-folder docs/md";
                tsConfigPath = path_1.join(dir, "tsconfig.json");
                tsConfig = fs_1.readFileSync(tsConfigPath)
                    .toString()
                    .replace('// "declaration":', '"declaration":')
                    .replace('// "declarationMap":', '"declarationMap":');
                io_1.write(tsConfigPath, tsConfig);
                return [4 /*yield*/, runLocalCommand("npx @microsoft/api-extractor init")];
            case 8:
                _g.sent();
                apiExtConfigPath = path_1.join(dir, "api-extractor.json");
                apiExtConfigBase = fs_1.readFileSync(apiExtConfigPath).toString();
                apiExtConfig = apiExtConfigBase.replace('"mainEntryPointFilePath": "<projectFolder>/lib', '"mainEntryPointFilePath": ".');
                io_1.write(apiExtConfigPath, apiExtConfig);
                return [3 /*break*/, 40];
            case 9:
                if (!(pkg === "Dotenv")) return [3 /*break*/, 10];
                devDependencies.push("dotenv");
                io_1.write(path_1.join(dir, ".env"), "");
                return [3 /*break*/, 40];
            case 10:
                if (!(pkg === "ESLint")) return [3 /*break*/, 15];
                devDependencies.push("eslint", "eslint-plugin-import");
                scripts.lint += ' && eslint "." --fix';
                prettierQuestion = getExtensionQuestion(pkg, "Prettier");
                _b = requestedPackages.includes("Prettier");
                if (!_b) return [3 /*break*/, 12];
                return [4 /*yield*/, confirm(prettierQuestion, true)];
            case 11:
                _b = (_g.sent());
                _g.label = 12;
            case 12:
                usePrettier = _b;
                tsQuestion = getExtensionQuestion(pkg, "TypeScript");
                _c = requestedPackages.includes("TypeScript");
                if (!_c) return [3 /*break*/, 14];
                return [4 /*yield*/, confirm(tsQuestion, true)];
            case 13:
                _c = (_g.sent());
                _g.label = 14;
            case 14:
                useTs = _c;
                esLintConfigPath = path_1.join(dir, ".eslintrc.json");
                esLintConfig = __assign({}, _eslintrc_json_1.default);
                if (usePrettier) {
                    esLintConfig = extendEsLintConfig(esLintConfig, "Prettier");
                    devDependencies.push("eslint-plugin-prettier");
                }
                if (useTs) {
                    esLintConfig = extendEsLintConfig(esLintConfig, "TypeScript");
                    devDependencies.push("@typescript-eslint/eslint-plugin", "@typescript-eslint/parser");
                }
                sortedEsLintConfig = util_1.sortJson(esLintConfig);
                io_1.write(esLintConfigPath, JSON.stringify(sortedEsLintConfig, null, 2));
                return [3 /*break*/, 40];
            case 15:
                if (!(pkg === "Firebase")) return [3 /*break*/, 17];
                dependencies.push("firebase");
                return [4 /*yield*/, runLocalCommand("npx firebase-tools init")];
            case 16:
                _g.sent();
                return [3 /*break*/, 40];
            case 17:
                if (!(pkg === "Git")) return [3 /*break*/, 18];
                gitIgnoreLines = ["node_modules"];
                requestedPackages.includes("Dotenv") && gitIgnoreLines.push(".env");
                gitIgnore = gitIgnoreLines.join("\n");
                gitIgnorePath = path_1.join(dir, ".gitignore");
                io_1.write(gitIgnorePath, gitIgnore);
                return [3 /*break*/, 40];
            case 18:
                if (!(pkg === "GitHub")) return [3 /*break*/, 20];
                files = [
                    ".github/ISSUE_TEMPLATE/bug_report.md",
                    ".github/ISSUE_TEMPLATE/feature_request.md",
                    ".github/workflows/ci.yml",
                    ".github/PULL_REQUEST_TEMPLATE.md",
                ];
                paths = files.map(function (file) { return path_1.join(dir, file); });
                return [4 /*yield*/, Promise.all(files.map(io_1.getTemplateFile))];
            case 19:
                texts = _g.sent();
                for (i in paths) {
                    path = paths[i];
                    text = texts[i];
                    io_1.write(path, text);
                }
                return [3 /*break*/, 40];
            case 20:
                if (!(pkg === "Jest")) return [3 /*break*/, 25];
                devDependencies.push("jest");
                scripts.test = "jest";
                if (!requestedPackages.includes("TypeScript")) return [3 /*break*/, 22];
                devDependencies.push("ts-jest", "@types/jest");
                indexTestTsPath = path_1.join(dir, "src/index.test.ts");
                indexTestTs = requestedPackages.includes("Svelte")
                    ? "export {}"
                    : "";
                io_1.write(indexTestTsPath, indexTestTs);
                return [4 /*yield*/, runLocalCommand("npx ts-jest config:init")];
            case 21:
                _g.sent();
                return [3 /*break*/, 24];
            case 22:
                indexTestJsPath = path_1.join(dir, "src/index.test.js");
                io_1.write(indexTestJsPath, "");
                return [4 /*yield*/, runLocalCommand("npx jest --init")];
            case 23:
                _g.sent();
                _g.label = 24;
            case 24: return [3 /*break*/, 40];
            case 25:
                if (!(pkg === "Prettier")) return [3 /*break*/, 27];
                devDependencies.push("prettier");
                scripts.lint += ' && prettier "." --write';
                prettierConfigPath = path_1.join(dir, ".prettierrc");
                return [4 /*yield*/, io_1.getTemplateFile(".prettierrc")];
            case 26:
                prettierConfig = _g.sent();
                io_1.write(prettierConfigPath, prettierConfig);
                return [3 /*break*/, 40];
            case 27:
                if (!(pkg === "SCSS")) return [3 /*break*/, 28];
                devDependencies.push("sass");
                if (!requestedPackages.includes("Tailwind")) {
                    scripts["build:scss"] = "sass src/index.scss public/index.css";
                    indexScssPath = path_1.join(dir, "src/index.scss");
                    io_1.write(indexScssPath, "");
                }
                return [3 /*break*/, 40];
            case 28:
                if (!(pkg === "Svelte")) return [3 /*break*/, 34];
                scripts["build:svelte"] = "rollup -c";
                scripts["dev:svelte"] = "rollup -c -w";
                scripts.lint += " && svelte-check";
                rollupConfigPath = path_1.join(dir, "rollup.config.js");
                return [4 /*yield*/, io_1.getTemplateFile("rollup.config.js")];
            case 29:
                rollupConfig = _g.sent();
                io_1.write(rollupConfigPath, rollupConfig);
                scripts.start = 'echo \\"No start script yet\\"';
                if (!requestedPackages.includes("TypeScript")) return [3 /*break*/, 32];
                tsSveltePath = path_1.join(dir, "scripts/tsSvelte.js");
                return [4 /*yield*/, io_1.getTemplateFile("scripts/tsSvelte.js")];
            case 30:
                tsSvelte = _g.sent();
                devDependencies.push("@tsconfig/svelte");
                io_1.write(tsSveltePath, tsSvelte);
                return [4 /*yield*/, runLocalCommand("node scripts/tsSvelte.js")];
            case 31:
                _g.sent();
                return [3 /*break*/, 33];
            case 32:
                devDependencies.push("@rollup/plugin-commonjs@^16.0.0", "@rollup/plugin-node-resolve@^10.0.0", "rollup@^2.3.4", "rollup-plugin-css-only@^3.1.0", "rollup-plugin-livereload@^2.0.0", "rollup-plugin-svelte@^7.0.0", "rollup-plugin-terser@^7.0.0", "svelte@^3.0.0");
                indexJsPath = path_1.join(dir, "src/index.js");
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
                if (!requestedPackages.includes("TypeScript")) {
                    io_1.write(indexJsPath, indexJs);
                }
                _g.label = 33;
            case 33: return [3 /*break*/, 40];
            case 34:
                if (!(pkg === "Tailwind")) return [3 /*break*/, 39];
                devDependencies.push("tailwindcss");
                question = "Would you like to use custom CSS with Tailwind?";
                return [4 /*yield*/, confirm(question, true)];
            case 35:
                if (!_g.sent()) return [3 /*break*/, 36];
                devDependencies.push("tailwindcss-cli");
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
                        "sass src/index.scss temp/index.css && tailwindcss-cli build temp/index.css -o public/index.css";
                    indexScssPath = path_1.join(dir, "src/index.scss");
                    indexScss = indexCss;
                    io_1.write(indexScssPath, indexScss);
                }
                else {
                    scripts["build:css"] =
                        "tailwindcss-cli build src/index.css -o public/index.css";
                    indexCssPath = path_1.join(dir, "src/index.css");
                    io_1.write(indexCssPath, indexCss);
                }
                return [3 /*break*/, 38];
            case 36: return [4 /*yield*/, runLocalCommand("npx tailwindcss-cli@latest build -o public/index.css")];
            case 37:
                _g.sent();
                _g.label = 38;
            case 38: return [3 /*break*/, 40];
            case 39:
                if (pkg === "TypeScript") {
                    devDependencies.push("typescript");
                    scripts["build:ts"] = "tsc";
                    indexTsPath = path_1.join(dir, "src/index.ts");
                    svelteTs = "export {}";
                    firebaseTs = [
                        'import firebase from "firebase/app";',
                        "",
                        "firebase.initializeApp({/* ... */});",
                    ].join("\n");
                    indexTs = requestedPackages.includes("Firebase")
                        ? firebaseTs
                        : requestedPackages.includes("Svelte")
                            ? svelteTs
                            : "";
                    io_1.write(indexTsPath, indexTs);
                }
                _g.label = 40;
            case 40:
                _i++;
                return [3 /*break*/, 7];
            case 41:
                buildScript = "";
                devScript = "";
                for (_d = 0, _e = Object.keys(scripts).sort(); _d < _e.length; _d++) {
                    script = _e[_d];
                    if (script.includes("build:")) {
                        buildScript += " && npm run " + script;
                    }
                    if (script.includes("dev:")) {
                        devScript += " && npm run " + script;
                    }
                }
                scripts.build = buildScript.slice(" && ".length);
                scripts.dev = devScript.slice(" && ".length);
                scripts.lint = scripts.lint.slice(" && ".length);
                packageJsonBase = JSON.parse(fs_1.readFileSync(packageJsonPath).toString());
                allScripts = util_1.deleteProperty(__assign(__assign({}, packageJsonBase.scripts), scripts), "validate");
                packageJson = __assign(__assign({}, packageJsonBase), { scripts: util_1.sortJson(allScripts) });
                io_1.write(packageJsonPath, JSON.stringify(packageJson, null, 2));
                finalDependencies = util_1.unique(dependencies).sort();
                finalDevDependencies = util_1.unique(devDependencies).sort();
                _f = !testing;
                if (!_f) return [3 /*break*/, 43];
                return [4 /*yield*/, confirm("Would you like to install NPM dependencies now?", true)];
            case 42:
                _f = (_g.sent());
                _g.label = 43;
            case 43:
                shouldInstall = _f;
                installCommand = "npm i " + finalDependencies.join(" ");
                installDevCommand = "npm i -D " + finalDevDependencies.join(" ");
                if (!shouldInstall) return [3 /*break*/, 46];
                return [4 /*yield*/, runLocalCommand(installCommand)];
            case 44:
                _g.sent();
                return [4 /*yield*/, runLocalCommand(installDevCommand)];
            case 45:
                _g.sent();
                _g.label = 46;
            case 46: return [2 /*return*/, {
                    dependencies: finalDependencies,
                    devDependencies: finalDevDependencies,
                }];
        }
    });
}); });
