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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProperty = exports.sortJson = exports.unique = void 0;
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
var deleteProperty = function (obj, property) {
    var result = __assign({}, obj);
    delete result[property];
    return result;
};
exports.deleteProperty = deleteProperty;
