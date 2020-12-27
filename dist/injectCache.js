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
exports.initDiff = exports.isModuleDepDec = void 0;
var MapCache_1 = __importDefault(require("./MapCache"));
exports.isModuleDepDec = function (obj) {
    if (Array.isArray(obj) && obj.length === 2) {
        if (typeof obj[0] !== 'string') {
            return false;
        }
        if (obj[1].state && !Array.isArray(obj[1].state)) {
            return false;
        }
        if (obj[1].maps && !Array.isArray(obj[1].maps)) {
            return false;
        }
        return true;
    }
    return false;
};
exports.initDiff = function (moduleDepDec, store) {
    var diff = {};
    var _loop_1 = function (moduleName) {
        if (moduleDepDec.hasOwnProperty(moduleName)) {
            diff[moduleName] = [];
            if (moduleDepDec[moduleName].state) {
                var stateCache = new MapCache_1.default(function () { return store.getModule(moduleName).state; }, __spreadArrays(moduleDepDec[moduleName].state, [function () { }]));
                stateCache.hasDepChanged();
                diff[moduleName].push(stateCache);
            }
            if (moduleDepDec[moduleName].maps) {
                var mapsCache = new MapCache_1.default(function () { return store.getModule(moduleName).maps; }, __spreadArrays(moduleDepDec[moduleName].maps, [function () { }]));
                mapsCache.hasDepChanged();
                diff[moduleName].push(mapsCache);
            }
        }
    };
    for (var moduleName in moduleDepDec) {
        _loop_1(moduleName);
    }
    var destroy = function () {
        for (var moduleName in diff) {
            diff[moduleName].forEach(function (cache) { return cache.destroy(); });
            diff[moduleName] = [];
        }
        diff = {};
    };
    return {
        diff: diff,
        destroy: destroy,
    };
};
