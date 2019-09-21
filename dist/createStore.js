"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.getStoreInstance = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:12:36
 * @modify date 2019-08-09 17:12:36
 * @desc [description]
 */
;
;
;
;

var isPromise = function isPromise(obj) {
  return obj && typeof obj.then === 'function';
};

var currentStoreInstance;

var isObj = function isObj(obj) {
  return !(_typeof(obj) !== 'object' || Array.isArray(obj) || obj === null);
};

var isStoreModule = function isStoreModule(obj) {
  if (!isObj(obj) || !isObj(obj.state) || !isObj(obj.actions)) {
    return false;
  }

  if (!!obj.maps && !isObj(obj.maps)) {
    return false;
  }

  return true;
};

var createStore = function createStore() {
  var modules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var lazyModules = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var currentModules = modules;
  var currentLazyModules = lazyModules;
  var listeners = {};
  var proxyActionsCache = {};
  var modulesCache = {}; // const cloneModules = (storeModule: StoreModule) => ({
  // 	...storeModule,
  // 	state: {...storeModule.state}
  // });

  var cloneModules = function cloneModules(storeModule) {
    return storeModule;
  };

  var clearProxyActionsCache = function clearProxyActionsCache(moduleName) {
    return delete proxyActionsCache[moduleName];
  };

  var clearModulesCache = function clearModulesCache(moduleName) {
    return delete modulesCache[moduleName];
  };

  var clearAllCache = function clearAllCache(moduleName) {
    clearModulesCache(moduleName);
    clearProxyActionsCache(moduleName);
  };

  var setState = function setState(moduleName, newState) {
    return currentModules[moduleName].state = newState;
  }; // 添加module


  var addModule = function addModule(moduleName, storeModule) {
    if (!!currentModules[moduleName]) {
      console.error(new Error("addModule: ".concat(moduleName, " already exists!")));
      return currentStoreInstance;
    }

    if (!isStoreModule(storeModule)) {
      console.error(new Error('addModule: storeModule is illegal!'));
      return currentStoreInstance;
    }

    currentModules = _objectSpread({}, currentModules, _defineProperty({}, moduleName, cloneModules(storeModule)));
    clearAllCache(moduleName);
    runListeners(moduleName);
    return currentStoreInstance;
  };

  var createActionsProxy = function createActionsProxy(moduleName) {
    if (!!proxyActionsCache[moduleName]) {
      return proxyActionsCache[moduleName];
    }

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
    proxyActionsCache[moduleName] = actionsProxy;
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
      console.log(new Error("getModule: ".concat(moduleName, " is not exist")));
      return {};
    }

    if (!!modulesCache[moduleName]) {
      return modulesCache[moduleName];
    }

    var proxyModule = _objectSpread({}, currentModules[moduleName]);

    proxyModule.actions = createActionsProxy(moduleName);
    proxyModule.maps = currentModules[moduleName].maps ? runMaps(currentModules[moduleName].maps, currentModules[moduleName].state) : undefined;
    modulesCache[moduleName] = proxyModule;
    return proxyModule;
  }; // 获取原本的module


  var getOriginModule = function getOriginModule(moduleName) {
    if (!currentModules[moduleName]) {
      console.log(new Error("getOriginModule: ".concat(moduleName, " is not exist")));
      return {};
    }

    return currentModules[moduleName];
  };

  var getLazyModule = function getLazyModule(moduleName) {
    if (!!currentLazyModules[moduleName]) {
      return currentLazyModules[moduleName];
    }

    console.warn(new Error("getLazyModule: ".concat(moduleName, " is not exist")));
    return function () {
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
    if (!isStoreModule(storeModule)) {
      console.error(new Error('setModule: storeModule is illegal!'));
      return currentStoreInstance;
    }

    currentModules = _objectSpread({}, currentModules, _defineProperty({}, moduleName, cloneModules(storeModule)));
    clearAllCache(moduleName);
    runListeners(moduleName);
    return currentStoreInstance;
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
      throw new Error("createDispatch: ".concat(moduleName, " is not exist!")); // return () => {};
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
        return newState;
      }

      if (isPromise(newState)) {
        return newState.then(function (ns) {
          var asyncActionHasReturn = ns !== undefined;
          var asyncActionDidChangeState = ns !== currentModules[moduleName].state;

          if (asyncActionHasReturn && asyncActionDidChangeState) {
            setState(moduleName, ns);
            clearModulesCache(moduleName);
            runListeners(moduleName);
          }

          return Promise.resolve(ns);
        });
      } else {
        setState(moduleName, newState);
        clearModulesCache(moduleName);
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
    getOriginModule: getOriginModule,
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
exports["default"] = _default;