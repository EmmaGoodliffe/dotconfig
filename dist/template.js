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
var input_1 = require("input");
var integration_1 = __importDefault(require("./integration"));
var io_1 = require("./io");
var template = function (pkg, theTemplate, outputDir, selectedPackages) { return __awaiter(void 0, void 0, void 0, function () {
    var deps, devDeps, commands, _i, _a, theIntegration, shouldUseIntegration, _b, dependencies, devDependencies, _c, _d, _e, extension, question, theExtension, options, shouldUseExtension, _f, dependencies, devDependencies;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                deps = __spreadArrays((theTemplate.dependencies || []));
                devDeps = __spreadArrays((theTemplate.devDependencies || []));
                return [4 /*yield*/, io_1.writeFiles(theTemplate.files || [], outputDir)];
            case 1:
                commands = _g.sent();
                if (!theTemplate.integrations) return [3 /*break*/, 5];
                _i = 0, _a = theTemplate.integrations;
                _g.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 5];
                theIntegration = _a[_i];
                shouldUseIntegration = theIntegration.integration.every(function (pkg) {
                    return selectedPackages.includes(pkg);
                });
                if (!shouldUseIntegration) return [3 /*break*/, 4];
                return [4 /*yield*/, integration_1.default(pkg, theIntegration, outputDir, selectedPackages)];
            case 3:
                _b = _g.sent(), dependencies = _b.dependencies, devDependencies = _b.devDependencies;
                deps.push.apply(deps, dependencies);
                devDeps.push.apply(devDeps, devDependencies);
                _g.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5:
                if (!theTemplate.extensions) return [3 /*break*/, 10];
                _c = [];
                for (_d in theTemplate.extensions)
                    _c.push(_d);
                _e = 0;
                _g.label = 6;
            case 6:
                if (!(_e < _c.length)) return [3 /*break*/, 10];
                extension = _c[_e];
                question = "Do you want to set up " + pkg + " with " + extension;
                theExtension = theTemplate.extensions[extension];
                options = { default: theExtension.default };
                return [4 /*yield*/, input_1.confirm(question, options)];
            case 7:
                shouldUseExtension = _g.sent();
                if (!shouldUseExtension) return [3 /*break*/, 9];
                return [4 /*yield*/, template(pkg + ":" + extension, theExtension.template, outputDir, selectedPackages)];
            case 8:
                _f = _g.sent(), dependencies = _f.dependencies, devDependencies = _f.devDependencies;
                deps.push.apply(deps, dependencies);
                devDeps.push.apply(devDeps, devDependencies);
                _g.label = 9;
            case 9:
                _e++;
                return [3 /*break*/, 6];
            case 10: return [2 /*return*/, {
                    dependencies: deps,
                    devDependencies: devDeps,
                    commands: commands.flat(),
                }];
        }
    });
}); };
exports.default = template;
