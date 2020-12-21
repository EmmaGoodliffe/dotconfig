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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var changes = function (input, changes) {
    var result = __assign({}, input);
    for (var _i = 0, changes_1 = changes; _i < changes_1.length; _i++) {
        var change = changes_1[_i];
        if (change.type === "Array") {
            if (change.modifier.add !== undefined) {
                var value = change.modifier.add;
                var previousValues = result[change.key];
                result[change.key] = __spreadArrays(previousValues, [value]);
            }
        }
        else if (change.type === "Object") {
            if (change.modifier.set !== undefined) {
                if (change.key.includes(".")) {
                    throw "Compound keys are not supported yet. Received: " + change.key;
                }
                var previousValues = result[change.key];
                result[change.key] = __assign(__assign({}, previousValues), change.modifier.set);
            }
        }
    }
    return result;
};
exports.default = changes;
