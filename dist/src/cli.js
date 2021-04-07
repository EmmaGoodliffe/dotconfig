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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ui = void 0;
var chalk_1 = __importDefault(require("chalk"));
var fs_1 = require("fs");
var input_1 = require("input");
var path_1 = require("path");
var yargs_1 = require("yargs");
var package_json_1 = require("../package.json");
var help_1 = __importDefault(require("./help"));
var index_1 = __importDefault(require("./index"));
var helpTip = "Run " + chalk_1.default.blue("dotconfig --help") + " for documentation";
exports.ui = {
    confirm: function (label, defaultAnswer) {
        return input_1.confirm(label, { default: defaultAnswer });
    },
    inputPackages: function (allPackages) {
        return input_1.checkboxes("Which packages would you like to configure?", allPackages.map(function (pkg) { return ({ name: pkg }); }));
    },
    onCommandError: function (command, err) {
        throw new Error("Command error running " + chalk_1.default.blue(command) + ": " + chalk_1.default.red(err));
    },
};
var getExpRecError = function (description, expected, received) { return "Expected " + description + " to be " + expected + "; received " + received; };
var getArgNumError = function (argNumReceived) {
    return getExpRecError("number of dotconfig arguments", "1", "" + argNumReceived);
};
var run = function () { return __awaiter(void 0, void 0, void 0, function () {
    var err, tip, err, dir;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (yargs_1.argv.help) {
                    console.log(help_1.default(package_json_1.version));
                    return [2 /*return*/];
                }
                if (yargs_1.argv.v || yargs_1.argv.version) {
                    console.log(package_json_1.version);
                    return [2 /*return*/];
                }
                if (yargs_1.argv._.length === 0) {
                    err = getArgNumError(yargs_1.argv._.length);
                    tip = "If you want to run dotconfig in the current directory, run " + chalk_1.default.blue("dotconfig .") + " or " + helpTip.toLowerCase();
                    throw new Error(err + ". " + tip);
                }
                else if (yargs_1.argv._.length > 1) {
                    err = getArgNumError(yargs_1.argv._.length);
                    throw new Error(err + ". " + helpTip);
                }
                dir = path_1.join(path_1.dirname(""), "" + yargs_1.argv._[0]);
                !fs_1.existsSync(dir) && fs_1.mkdirSync(dir, { recursive: true });
                return [4 /*yield*/, index_1.default(dir, { ui: exports.ui })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
run().catch(console.error);
