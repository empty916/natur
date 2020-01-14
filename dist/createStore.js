"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.getStoreInstance = void 0;

var _utils = require("./utils");

var _MapCache = _interopRequireDefault(require("./MapCache"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

;
;
;
;
var currentStoreInstance;

var createStore = function createStore() {
  var modules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var lazyModules = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var initStates = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var middlewares = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

  var currentInitStates = _objectSpread({}, initStates);

  var currentModules = {};
  var currentLazyModules = lazyModules;
  var listeners = {};
  var allModuleNames;

  var currentMiddlewares = _toConsumableArray(middlewares);

  var actionsProxyCache = {};
  var mapsCache = {};
  var mapsCacheList = {};

  var replaceModule = function replaceModule(moduleName, storeModule) {
    var res;

    if (!!currentInitStates[moduleName]) {
      res = _objectSpread({}, storeModule, {
        state: currentInitStates[moduleName]
      });
      delete currentInitStates[moduleName];
    } else {
      res = _objectSpread({}, storeModule);
    }

    return res;
  }; // 查看module是否存在


  var hasModule = function hasModule(moduleName) {
    return !!currentModules[moduleName];
  };

  var checkModuleIsValid = function checkModuleIsValid(moduleName) {
    if (!hasModule(moduleName)) {
      var errMsg = "module: ".concat(moduleName, " is not valid!");
      console.error(errMsg);
      throw new Error(errMsg);
    }
  };

  var clearActionsProxyCache = function clearActionsProxyCache(moduleName) {
    return delete actionsProxyCache[moduleName];
  };

  var clearMapsProxyCache = function clearMapsProxyCache(moduleName) {
    delete mapsCache[moduleName];
    mapsCacheList[moduleName].forEach(function (i) {
      return i.destroy();
    });
    delete mapsCacheList[moduleName];
  };

  var mapsCacheShouldCheckForValid = function mapsCacheShouldCheckForValid(moduleName) {
    mapsCacheList[moduleName].forEach(function (i) {
      return i.shouldCheckCache();
    });
  };

  var clearAllCache = function clearAllCache(moduleName) {
    clearMapsProxyCache(moduleName);
    clearActionsProxyCache(moduleName);
  };

  var getAllModuleName = function getAllModuleName() {
    if (!allModuleNames) {
      allModuleNames = _toConsumableArray(new Set([].concat(_toConsumableArray(Object.keys(currentModules)), _toConsumableArray(Object.keys(currentLazyModules)))));
    }

    return allModuleNames;
  };

  var runListeners = function runListeners(moduleName) {
    return Array.isArray(listeners[moduleName]) && listeners[moduleName].forEach(function (listener) {
      return listener();
    });
  };

  var setState = function setState(moduleName, newState) {
    var stateHasNoChange = currentModules[moduleName].state === newState;

    if (stateHasNoChange) {
      return newState;
    }

    currentModules[moduleName].state = newState;
    mapsCacheShouldCheckForValid(moduleName);
    runListeners(moduleName);
    return currentModules[moduleName].state;
  }; // 修改module


  var setModule = function setModule(moduleName, storeModule) {
    if (!(0, _utils.isStoreModule)(storeModule)) {
      var errMsg = "setModule: storeModule ".concat(moduleName, " is illegal!");
      console.error(errMsg);
      throw new Error(errMsg);
    }

    var isModuleExist = hasModule(moduleName);
    currentModules = _objectSpread({}, currentModules, _defineProperty({}, moduleName, replaceModule(moduleName, storeModule)));

    if (isModuleExist) {
      clearAllCache(moduleName);
    } else {
      allModuleNames = undefined;
    }

    if (!mapsCache[moduleName]) {
      mapsCache[moduleName] = {};
      mapsCacheList[moduleName] = [];
    }

    runListeners(moduleName);
    return currentStoreInstance;
  };

  var destoryModule = function destoryModule(moduleName) {
    delete currentModules[moduleName];
    delete currentLazyModules[moduleName];
    allModuleNames = undefined;
    clearAllCache(moduleName);
  };

  var removeModule = function removeModule(moduleName) {
    destoryModule(moduleName);
    runListeners(moduleName);
    return currentStoreInstance;
  };

  var createMapsProxy = function createMapsProxy(moduleName) {
    var maps = currentModules[moduleName].maps;

    if (maps === undefined) {
      return undefined;
    }

    var proxyMaps = {};

    for (var key in maps) {
      if (maps.hasOwnProperty(key)) {
        if (mapsCache[moduleName][key] === undefined) {
          mapsCache[moduleName][key] = new _MapCache["default"](function () {
            return currentModules[moduleName].state;
          }, maps[key]);
          mapsCacheList[moduleName].push(mapsCache[moduleName][key]);
        }

        var targetWatcher = mapsCache[moduleName][key];
        proxyMaps[key] = targetWatcher.getValue();
      }
    }

    return proxyMaps;
  };

  var createActionsProxy = function createActionsProxy(moduleName) {
    if (!!actionsProxyCache[moduleName]) {
      return actionsProxyCache[moduleName];
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
    actionsProxyCache[moduleName] = actionsProxy;
    return actionsProxy;
  }; // 获取module


  var getModule = function getModule(moduleName) {
    checkModuleIsValid(moduleName);
    var proxyModule = {
      state: currentModules[moduleName].state,
      actions: createActionsProxy(moduleName),
      maps: createMapsProxy(moduleName)
    }; // if (!!Object.defineProperty) {
    // 	Object.defineProperty(proxyModule, 'state', {
    // 		get() {
    // 			return currentModules[moduleName].state;
    // 		}
    // 	});
    // }

    return proxyModule;
  }; // 获取原本的module


  var getOriginModule = function getOriginModule(moduleName) {
    checkModuleIsValid(moduleName);
    return currentModules[moduleName];
  };

  var getLazyModule = function getLazyModule(moduleName) {
    if (!!currentLazyModules[moduleName]) {
      return currentLazyModules[moduleName];
    }

    var errMsg = "getLazyModule: ".concat(moduleName, " is not exist");
    console.error(errMsg);
    throw new Error(errMsg);
  };

  var createDispatch = function createDispatch(moduleName) {
    checkModuleIsValid(moduleName);

    var setStateProxy = function setStateProxy(_ref) {
      var state = _ref.state,
          _moduleName = _ref.moduleName;
      return setState(_moduleName, state);
    };

    var middlewareParams = {
      setState: setStateProxy,
      getState: function getState() {
        return currentModules[moduleName].state;
      }
    };
    var chain = currentMiddlewares.map(function (middleware) {
      return middleware(middlewareParams);
    });

    var setStateProxyWithMiddleware = _utils.compose.apply(void 0, _toConsumableArray(chain))(setStateProxy);

    return function (type) {
      var _targetModule$actions;

      checkModuleIsValid(moduleName);
      var newState;
      var targetModule = currentModules[moduleName];

      for (var _len2 = arguments.length, data = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        data[_key2 - 1] = arguments[_key2];
      }

      newState = (_targetModule$actions = targetModule.actions)[type].apply(_targetModule$actions, data);
      return setStateProxyWithMiddleware({
        moduleName: moduleName,
        actionName: type,
        state: newState
      });
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

  var destory = function destory() {
    Object.keys(currentModules).forEach(destoryModule);
    currentInitStates = {};
    currentLazyModules = {};
    listeners = {};
    allModuleNames = undefined;
    currentMiddlewares = [];
  };

  var init = function init() {
    if (!!currentStoreInstance) {
      currentStoreInstance.destory();
    }

    Object.keys(modules).forEach(function (moduleName) {
      setModule(moduleName, modules[moduleName]);
    });
  };

  init();
  currentStoreInstance = {
    getAllModuleName: getAllModuleName,
    getModule: getModule,
    removeModule: removeModule,
    getOriginModule: getOriginModule,
    getLazyModule: getLazyModule,
    setModule: setModule,
    hasModule: hasModule,
    subscribe: subscribe,
    destory: destory
  };
  return currentStoreInstance;
};

var getStoreInstance = function getStoreInstance() {
  return currentStoreInstance;
};

exports.getStoreInstance = getStoreInstance;
var _default = createStore;
exports["default"] = _default;