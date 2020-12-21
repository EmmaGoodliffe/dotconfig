"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ajv_1 = __importDefault(require("ajv"));
var fs_1 = require("fs");
var ajv = new ajv_1.default();
var removeDotPrefix = function (x) {
    if (x.slice(0, 1) === ".") {
        x = x.slice(1);
    }
    return x;
};
var parseDataPath = function (dataPath) {
    var elements = dataPath
        .split("/")
        .filter(function (el) { return el.trim().length; })
        .map(function (el) {
        var num = parseInt(el);
        return isNaN(num) ? "." + el : "[" + num + "]";
    });
    var result = removeDotPrefix(elements.join(""));
    return result;
};
var runSchema = function (data, schemaPath) {
    var schema = JSON.parse(fs_1.readFileSync(schemaPath).toString());
    var validate = ajv.compile(schema);
    var result = validate(data);
    if (!result) {
        if (!validate.errors) {
            throw "Unknown error validating schema";
        }
        for (var _i = 0, _a = validate.errors; _i < _a.length; _i++) {
            var error = _a[_i];
            console.error("Error details:", error);
            throw "Data does not match schema. " + parseDataPath(error.dataPath) + " " + error.message;
        }
    }
};
exports.default = runSchema;