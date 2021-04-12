"use strict";
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
var chalk_1 = __importDefault(require("chalk"));
var input_1 = require("input");
var divider = "---";
var plainDividerCheckboxes = function (label, choices) {
    var dividerChoices = __spreadArrays(choices);
    dividerChoices.push({ name: divider, disabled: true });
    return input_1.checkboxes(label, dividerChoices);
};
var ui = {
    confirm: function (label, defaultAnswer) {
        return input_1.confirm(label, { default: defaultAnswer });
    },
    inputEnd: function () {
        return input_1.select("Is your project front-end or back-end?", [
            { name: "Front-end", value: "front" },
            { name: "Back-end", value: "back" },
            { name: "Full-stack (both)", value: "both" },
        ]);
    },
    inputPackages: function (allPackages) {
        return plainDividerCheckboxes("Which packages would you like to configure?", allPackages.map(function (pkg) { return ({ name: pkg, disabled: false }); }));
    },
    log: console.log,
    onCommandError: function (command, err) {
        throw new Error("Command error running " + chalk_1.default.blue(command) + ": " + chalk_1.default.red(err));
    },
};
exports.default = ui;
