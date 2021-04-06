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
        for (var i in object) {
            object[i] = exports.sortJson(object[i]);
        }
        return object;
    }
    else if (isObject(object)) {
        var keys = Object.keys(object).sort();
        var newObject = {};
        for (var i in keys) {
            var key = keys[i];
            newObject[key] = exports.sortJson(object[key]);
        }
        return newObject;
    }
    return object;
};
exports.sortJson = sortJson;
