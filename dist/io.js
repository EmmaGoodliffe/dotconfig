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
exports.runCommand = exports.info = exports.write = exports.getTemplateFile = void 0;
var chalk_1 = __importDefault(require("chalk"));
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var node_fetch_1 = __importDefault(require("node-fetch"));
var path_1 = require("path");
var defaultUrl = "https://raw.githubusercontent.com/EmmaGoodliffe/default/master/";
var getTemplateFile = function (file) { return __awaiter(void 0, void 0, void 0, function () {
    var url, response, text;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = defaultUrl + file;
                return [4 /*yield*/, node_fetch_1.default(url)];
            case 1:
                response = _a.sent();
                return [4 /*yield*/, response.text()];
            case 2:
                text = _a.sent();
                if (response.ok) {
                    return [2 /*return*/, text];
                }
                throw new Error("Template file " + chalk_1.default.blue(url) + " failed (" + chalk_1.default.red(response.status) + "): " + chalk_1.default.red(text));
        }
    });
}); };
exports.getTemplateFile = getTemplateFile;
var write = function (path, text) {
    var pathDir = path_1.dirname(path);
    var exists = fs_1.existsSync(pathDir);
    !exists && fs_1.mkdirSync(pathDir, { recursive: true });
    fs_1.writeFileSync(path, text);
};
exports.write = write;
var info = function (content, log) {
    return log(chalk_1.default.blue("i") + " " + content);
};
exports.info = info;
var runCommand = function (command, dir, log, onCommandError) { return __awaiter(void 0, void 0, void 0, function () {
    var err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, log(chalk_1.default.blue("=== " + command + " ==="))];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 5, , 7]);
                return [4 /*yield*/, new Promise(function (resolve, reject) {
                        var words = command.split(" ");
                        var main = words[0];
                        var args = words.slice(1);
                        var output = child_process_1.spawn(main, args, { cwd: dir, stdio: "inherit" });
                        output.on("close", function () { return resolve(); });
                        output.on("error", function (err) { return reject(err); });
                    })];
            case 3:
                _a.sent();
                return [4 /*yield*/, log("")];
            case 4:
                _a.sent();
                return [3 /*break*/, 7];
            case 5:
                err_1 = _a.sent();
                return [4 /*yield*/, onCommandError(command, err_1)];
            case 6:
                _a.sent();
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.runCommand = runCommand;
