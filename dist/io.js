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
exports.writeFiles = void 0;
var fs_1 = require("fs");
var input_1 = require("input");
var node_fetch_1 = __importDefault(require("node-fetch"));
var path_1 = require("path");
var url_1 = require("url");
var readFile = fs_1.promises.readFile, writeFile = fs_1.promises.writeFile;
var defaultUrl = "https://raw.githubusercontent.com/EmmaGoodliffe/default/master/";
var recursivelyCreateDir = function (path) {
    var parent = path_1.dirname(path);
    var pathExists = fs_1.existsSync(path);
    var parentExists = fs_1.existsSync(parent);
    if (pathExists) {
        return;
    }
    else if (parentExists) {
        fs_1.mkdirSync(path);
        return;
    }
    else {
        recursivelyCreateDir(parent);
        fs_1.mkdirSync(path);
        return;
    }
};
var getFile = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var isFile, buffer, raw, response, raw;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                isFile = url_1.parse(url).protocol === null;
                if (!isFile) return [3 /*break*/, 2];
                return [4 /*yield*/, readFile(path_1.resolve(__dirname, url))];
            case 1:
                buffer = _a.sent();
                raw = buffer.toString();
                return [2 /*return*/, raw];
            case 2: return [4 /*yield*/, node_fetch_1.default(url)];
            case 3:
                response = _a.sent();
                return [4 /*yield*/, response.text()];
            case 4:
                raw = _a.sent();
                return [2 /*return*/, raw];
        }
    });
}); };
var writeFiles = function (files, outputDir) {
    var promises = files.map(function (file) { return __awaiter(void 0, void 0, void 0, function () {
        var fullDefaultUrl, url, raw, _a, path, dir, description, question, options, shouldWrite, _b, _c, result;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    fullDefaultUrl = file.commands ? null : defaultUrl + file.file;
                    url = file.url || fullDefaultUrl;
                    _a = url;
                    if (!_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, getFile(url)];
                case 1:
                    _a = (_d.sent());
                    _d.label = 2;
                case 2:
                    raw = _a;
                    path = path_1.resolve(outputDir, file.file);
                    dir = path_1.dirname(path);
                    recursivelyCreateDir(dir);
                    description = file.override ? "recommended" : "optional";
                    question = path + " already exists. Do you want to override it (" + description + ")?";
                    options = { default: file.override };
                    _b = !fs_1.existsSync(path);
                    if (_b) return [3 /*break*/, 4];
                    return [4 /*yield*/, input_1.confirm(question, options)];
                case 3:
                    _b = (_d.sent());
                    _d.label = 4;
                case 4:
                    shouldWrite = _b;
                    _c = shouldWrite && raw;
                    if (!_c) return [3 /*break*/, 6];
                    return [4 /*yield*/, writeFile(path, raw)];
                case 5:
                    _c = (_d.sent());
                    _d.label = 6;
                case 6:
                    _c;
                    result = shouldWrite && file.commands;
                    return [2 /*return*/, result || []];
            }
        });
    }); });
    return Promise.all(promises);
};
exports.writeFiles = writeFiles;
