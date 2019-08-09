"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.getStoreInstance = void 0;

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.set");

require("core-js/modules/es6.promise");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var isPromise = function isPromise(obj) {
  return obj && typeof obj.then === 'function';
};

var currentStoreInstance;

var createStore = function createStore() {
  var modules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var lazyModules = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var currentModules = modules;
  var currentLazyModules = lazyModules;
  var listeners = {};

  var setState = function setState(moduleName, newState) {
    return currentModules[moduleName].state = newState;
  }; // 添加module


  var addModule = function addModule(moduleName, storeModule) {
    if (!!currentModules[moduleName]) {
      console.log(new Error('action module has exist!'));
      return;
    }

    currentModules = _objectSpread({}, currentModules, _defineProperty({}, moduleName, storeModule));
    runListeners(moduleName);
  };

  var createActionsProxy = function createActionsProxy(moduleName) {
    var actionsProxy = _objectSpread({}, currentModules[moduleName].actions);

    var dispatch = createDispatch(moduleName);
    Object.keys(actionsProxy).forEach(function (key) {
      return actionsProxy[key] = function () {
        for (var _len = arguments.length, data = new Array(_len), _key = 0; _key < _len; _key++) {
          data[_key] = arguments[_key];
        }

        return dispatch.apply(void 0, [key].concat(data));
      };
    });
    return actionsProxy;
  };

  var runMaps = function runMaps(maps, state) {
    if (!maps) {
      return {};
    }

    var mapsKeys = Object.keys(maps);

    if (!mapsKeys.length) {
      return {};
    }

    var resultMaps = mapsKeys.reduce(function (rm, key) {
      rm[key] = typeof maps[key] === 'function' ? maps[key](state) : maps[key];
      return rm;
    }, {});
    return resultMaps;
  }; // 获取module


  var getModule = function getModule(moduleName) {
    if (!currentModules[moduleName]) {
      console.log(new Error("module: ".concat(moduleName, " is not exist")));
      return {};
    }

    var proxyModule = _objectSpread({}, currentModules[moduleName]);

    proxyModule.actions = createActionsProxy(moduleName);
    proxyModule.maps = proxyModule.maps ? runMaps(proxyModule.maps, proxyModule.state) : {};
    return proxyModule;
  };

  var getLazyModule = function getLazyModule(moduleName) {
    return currentLazyModules[moduleName] || function () {
      return Promise.resolve({
        actions: {},
        state: {}
      });
    };
  };

  var getAllModuleName = function getAllModuleName() {
    return _toConsumableArray(new Set([].concat(_toConsumableArray(Object.keys(currentModules)), _toConsumableArray(Object.keys(currentLazyModules)))));
  }; // 修改module


  var setModule = function setModule(moduleName, storeModule) {
    if (currentModules[moduleName] !== storeModule) {
      currentModules = _objectSpread({}, currentModules, _defineProperty({}, moduleName, storeModule));
      runListeners(moduleName);
    }

    ;
  }; // 查看module是否存在


  var hasModule = function hasModule(moduleName) {
    return !!currentModules[moduleName];
  };

  var runListeners = function runListeners(moduleName) {
    return Array.isArray(listeners[moduleName]) && listeners[moduleName].forEach(function (listener) {
      return listener();
    });
  };

  var createDispatch = function createDispatch(moduleName) {
    if (!hasModule(moduleName)) {
      console.log(new Error('module is not exist!'));
      return function () {};
    }

    return function (type) {
      var _currentModules$modul;

      var newState;
      var moduleIsInvalid = !hasModule(moduleName);
      var moduleActionIsInvalid = !currentModules[moduleName].actions[type];

      if (moduleIsInvalid || moduleActionIsInvalid) {
        return;
      }

      for (var _len2 = arguments.length, data = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        data[_key2 - 1] = arguments[_key2];
      }

      newState = (_currentModules$modul = currentModules[moduleName].actions)[type].apply(_currentModules$modul, data);
      var actionHasNoReturn = newState === undefined;
      var stateIsNotChanged = newState === currentModules[moduleName].state;

      if (actionHasNoReturn || stateIsNotChanged) {
        return;
      }

      if (isPromise(newState)) {
        return newState.then(function (ns) {
          var asyncActionHasReturn = ns !== undefined;
          var asyncActionDidChangeState = ns !== currentModules[moduleName].state;

          if (asyncActionHasReturn && asyncActionDidChangeState) {
            setState(moduleName, ns);
            runListeners(moduleName);
          }

          return Promise.resolve(ns);
        });
      } else {
        setState(moduleName, newState);
        runListeners(moduleName);
        return newState;
      }
    };
  };

  var subscribe = function subscribe(moduleName, listener) {
    if (!listeners[moduleName]) {
      listeners[moduleName] = [];
    }

    listeners[moduleName].push(listener);
    return function () {
      return listeners[moduleName] = listeners[moduleName].filter(function (lis) {
        return listener !== lis;
      });
    };
    ;
  };

  currentStoreInstance = {
    createDispatch: createDispatch,
    addModule: addModule,
    getAllModuleName: getAllModuleName,
    getModule: getModule,
    getLazyModule: getLazyModule,
    setModule: setModule,
    hasModule: hasModule,
    subscribe: subscribe
  };
  return currentStoreInstance;
};

var getStoreInstance = function getStoreInstance() {
  return currentStoreInstance;
};

exports.getStoreInstance = getStoreInstance;
var _default = createStore;
exports.default = _default;