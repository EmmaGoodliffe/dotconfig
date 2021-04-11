"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortJson = exports.unique = void 0;
var unique = function (arr) { return Array.from(new Set(arr)); };
exports.unique = unique;
var isObject = function (obj) {
    return obj instanceof Object && !(obj instanceof Array);
};
var sortJson = function (object) {
    if (object instanceof Array) {
        return object.map(exports.sortJson);
    }
    else if (isObject(object)) {
        var keys = Object.keys(object).sort();
        var newObject = {};
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            newObject[key] = exports.sortJson(object[key]);
        }
        return newObject;
    }
    return object;
};
exports.sortJson = sortJson;
