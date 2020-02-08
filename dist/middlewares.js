"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shallowEqualMiddleware = exports.filterNonObjectMiddleware = exports.promiseMiddleware = exports.thunkMiddleware = void 0;

var _utils = require("./utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var thunkMiddleware = function thunkMiddleware(_ref) {
  var getState = _ref.getState,
      getMaps = _ref.getMaps;
  return function (next) {
    return function (record) {
      if (typeof record.state === 'function') {
        var setState = function setState(s) {
          return next(_objectSpread({}, record, {
            state: s
          }));
        };

        return next(_objectSpread({}, record, {
          state: record.state(getState, setState, getMaps)
        }));
      }

      return next(record);
    };
  };
};

exports.thunkMiddleware = thunkMiddleware;

var promiseMiddleware = function promiseMiddleware() {
  return function (next) {
    return function (record) {
      if ((0, _utils.isPromise)(record.state)) {
        return record.state.then(function (ns) {
          return next(_objectSpread({}, record, {
            state: ns
          }));
        });
      }

      return next(record);
    };
  };
};

exports.promiseMiddleware = promiseMiddleware;

var filterNonObjectMiddleware = function filterNonObjectMiddleware() {
  return function (next) {
    return function (record) {
      if (!(0, _utils.isObj)(record.state)) {
        return record.state;
      }

      return next(record);
    };
  };
};

exports.filterNonObjectMiddleware = filterNonObjectMiddleware;

var shallowEqualMiddleware = function shallowEqualMiddleware(_ref2) {
  var getState = _ref2.getState;
  return function (next) {
    return function (record) {
      var oldState = getState();

      if ((0, _utils.isEqualWithDepthLimit)(record.state, oldState, 1)) {
        return record.state;
      }

      return next(record);
    };
  };
};

exports.shallowEqualMiddleware = shallowEqualMiddleware;