function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { isPromise, isObj, isEqualWithDepthLimit } from './utils';
export var thunkMiddleware = function thunkMiddleware(_ref) {
  var getState = _ref.getState,
      getMaps = _ref.getMaps,
      dispatch = _ref.dispatch;
  return function (next) {
    return function (record) {
      if (typeof record.state === 'function') {
        var setState = function setState(s) {
          return next(_objectSpread({}, record, {
            state: s
          }));
        };

        var _dispatch = function _dispatch(action) {
          for (var _len = arguments.length, arg = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            arg[_key - 1] = arguments[_key];
          }

          if (/^\w+\/\w+$/.test(action)) {
            var moduleName = action.split('/')[0];
            var actionName = action.split('/').slice(1).join('/');
            return dispatch.apply(void 0, [moduleName, actionName].concat(arg));
          }

          return dispatch.apply(void 0, [record.moduleName, action].concat(arg));
        };

        return next(_objectSpread({}, record, {
          state: record.state({
            getState: getState,
            setState: setState,
            getMaps: getMaps,
            dispatch: _dispatch
          })
        }));
      }

      return next(record);
    };
  };
};
export var promiseMiddleware = function promiseMiddleware() {
  return function (next) {
    return function (record) {
      if (isPromise(record.state)) {
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
export var filterNonObjectMiddleware = function filterNonObjectMiddleware() {
  return function (next) {
    return function (record) {
      if (!isObj(record.state)) {
        return record.state;
      }

      return next(record);
    };
  };
};
export var shallowEqualMiddleware = function shallowEqualMiddleware(_ref2) {
  var getState = _ref2.getState;
  return function (next) {
    return function (record) {
      var oldState = getState();

      if (isEqualWithDepthLimit(record.state, oldState, 1)) {
        return record.state;
      }

      return next(record);
    };
  };
};
export var fillObjectRestDataMiddleware = function fillObjectRestDataMiddleware(_ref3) {
  var getState = _ref3.getState;
  return function (next) {
    return function (record) {
      var currentState = getState();

      if (isObj(record.state) && isObj(currentState)) {
        record = Object.assign({}, record, {
          state: Object.assign({}, currentState, record.state)
        });
      }

      return next(record);
    };
  };
};
export var filterUndefinedMiddleware = function filterUndefinedMiddleware() {
  return function (next) {
    return function (record) {
      if (record.state === undefined) {
        return undefined;
      }

      return next(record);
    };
  };
};