"use strict";
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
var change_1 = __importDefault(require("./change"));
var io_1 = require("./io");
var runTemplate = function (pkg, template, selectedPackages, outputDir) { return __awaiter(void 0, void 0, void 0, function () {
    var deps, devDeps, _i, _a, integration, useIntegration, _b, _c, override, file, changes, path, beforeBuffer, beforeRaw, before, after, afterRaw, _d, _e, _f, extension, question, answer, extTemplate, _g, dependencies, devDependencies;
    return __generator(this, function (_h) {
        switch (_h.label) {
            case 0:
                deps = template.dependencies ? __spreadArrays(template.dependencies) : [];
                devDeps = template.devDependencies ? __spreadArrays(template.devDependencies) : [];
                return [4 /*yield*/, io_1.writeFiles(template.files, outputDir)];
            case 1:
                _h.sent();
                if (!template.integrations) return [3 /*break*/, 8];
                _i = 0, _a = template.integrations;
                _h.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 8];
                integration = _a[_i];
                useIntegration = integration.integration.every(function (pkg) {
                    return selectedPackages.includes(pkg);
                });
                if (!useIntegration) return [3 /*break*/, 7];
                return [4 /*yield*/, io_1.writeFiles(integration.template.files, outputDir)];
            case 3:
                _h.sent();
                if (!integration.overridesJSON) return [3 /*break*/, 7];
                _b = 0, _c = integration.overridesJSON;
                _h.label = 4;
            case 4:
                if (!(_b < _c.length)) return [3 /*break*/, 7];
                override = _c[_b];
                file = override.file, changes = override.changes;
                path = path_1.resolve(outputDir, file);
                if (!fs_1.existsSync(file)) {
                    throw pkg + "~" + integration.integration + " expected " + path + " to exist";
                }
                return [4 /*yield*/, io_1.readFile(file)];
            case 5:
                beforeBuffer = _h.sent();
                beforeRaw = beforeBuffer.toString();
                before = JSON.parse(beforeRaw);
                after = change_1.default(before, changes);
                afterRaw = JSON.stringify(after);
                io_1.writeFile(file, afterRaw);
                _h.label = 6;
            case 6:
                _b++;
                return [3 /*break*/, 4];
            case 7:
                _i++;
                return [3 /*break*/, 2];
            case 8:
                if (!template.extensions) return [3 /*break*/, 12];
                _d = [];
                for (_e in template.extensions)
                    _d.push(_e);
                _f = 0;
                _h.label = 9;
            case 9:
                if (!(_f < _d.length)) return [3 /*break*/, 12];
                extension = _d[_f];
                question = "Do you want to set up " + pkg + " with " + extension;
                console.log({ question: question });
                answer = false;
                if (!answer) return [3 /*break*/, 11];
                extTemplate = template.extensions[extension];
                return [4 /*yield*/, runTemplate(pkg + ":" + extension, extTemplate, selectedPackages, outputDir)];
            case 10:
                _g = _h.sent(), dependencies = _g.dependencies, devDependencies = _g.devDependencies;
                deps.push.apply(deps, dependencies);
                devDeps.push.apply(devDeps, devDependencies);
                _h.label = 11;
            case 11:
                _f++;
                return [3 /*break*/, 9];
            case 12: return [2 /*return*/, {
                    dependencies: deps,
                    devDependencies: devDeps,
                }];
        }
    });
}); };
exports.default = runTemplate;
