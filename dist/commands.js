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
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var input_1 = require("input");
var path_1 = require("path");
var formatList = function (arr) { return (arr.length ? arr.join("\n") : "None"); };
var getQuestion = function (command, files, outputDir) {
    var uniqueFiles = Array.from(new Set(files));
    var affectedFiles = uniqueFiles.filter(function (file) {
        var path = path_1.resolve(outputDir, file);
        return fs_1.existsSync(path);
    });
    var formattedFiles = formatList(affectedFiles);
    return [
        "Do you want to run " + command + " which will override the following files?: " + formattedFiles,
        affectedFiles,
    ];
};
var run = function (command) {
    console.log("Run: " + command);
};
var commands = function (theCommands, outputDir) { return __awaiter(void 0, void 0, void 0, function () {
    var files, description, _a, question, affectedFiles, options, shouldRunAll, _i, theCommands_1, command, _b, theCommands_2, command, _c, question_1, affectedFiles_1, options_1;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                files = theCommands.map(function (command) { return command.affectedFiles; }).flat();
                description = "automatic configuration";
                _a = getQuestion(description, files, outputDir), question = _a[0], affectedFiles = _a[1];
                options = { default: !affectedFiles.length };
                return [4 /*yield*/, input_1.confirm(question, options)];
            case 1:
                shouldRunAll = _d.sent();
                if (!shouldRunAll) return [3 /*break*/, 2];
                for (_i = 0, theCommands_1 = theCommands; _i < theCommands_1.length; _i++) {
                    command = theCommands_1[_i];
                    run(command.command);
                }
                return [3 /*break*/, 6];
            case 2:
                _b = 0, theCommands_2 = theCommands;
                _d.label = 3;
            case 3:
                if (!(_b < theCommands_2.length)) return [3 /*break*/, 6];
                command = theCommands_2[_b];
                _c = getQuestion(command.command, command.affectedFiles, outputDir), question_1 = _c[0], affectedFiles_1 = _c[1];
                options_1 = { default: !affectedFiles_1.length };
                return [4 /*yield*/, input_1.confirm(question_1, options_1)];
            case 4:
                if (_d.sent()) {
                    run(command.command);
                }
                _d.label = 5;
            case 5:
                _b++;
                return [3 /*break*/, 3];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.default = commands;
