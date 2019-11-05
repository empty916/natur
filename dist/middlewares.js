"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.filterNonObjectMiddleware = exports.promiseMiddleware = void 0;

var _utils = require("./utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
}; // export const shallowEqualMiddleware: Middleware = ({getState}) => next => record => {
// 	const oldState = getState();
// 	if (isEqualWithDepthLimit(record.state, oldState, 1)) {
// 		return record.state;
// 	}
// 	return next(record);
// }


exports.filterNonObjectMiddleware = filterNonObjectMiddleware;