function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:12:36
 * @modify date 2019-08-09 17:12:36
 * @desc [description]
 */
import { // ObjChangedKeys,
compose, isStoreModule } from './utils';
import MapCache from './MapCache';
;
;
;
;
var currentStoreInstance;

var createStore = function createStore(modules, lazyModules, initStates, middlewares) {
  if (modules === void 0) {
    modules = {};
  }

  if (lazyModules === void 0) {
    lazyModules = {};
  }

  if (initStates === void 0) {
    initStates = {};
  }

  if (middlewares === void 0) {
    middlewares = [];
  }

  var currentInitStates = _objectSpread({}, initStates);

  var resetStateData = {};
  var currentModules = {};

  var currentLazyModules = _objectSpread({}, lazyModules);

  var listeners = {};
  var allModuleNames;
  var currentMiddlewares = [].concat(middlewares);
  var setStateProxyWithMiddlewareCache = {};
  var actionsProxyCache = {};
  var mapsCache = {};
  var mapsCacheList = {};

  var replaceModule = function replaceModule(moduleName, storeModule) {
    var res; // 缓存每个模块的初始化状态，供globalResetStates使用

    resetStateData[moduleName] = storeModule.state;

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
      var errMsg = "module: " + moduleName + " is not valid!";
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
      allModuleNames = Object.keys(_objectSpread({}, currentModules, {}, currentLazyModules));
    }

    return allModuleNames;
  };

  var runListeners = function runListeners(moduleName, me) {
    return Array.isArray(listeners[moduleName]) && listeners[moduleName].forEach(function (listener) {
      return listener(me);
    });
  };

  var setState = function setState(_ref) {
    var moduleName = _ref.moduleName,
        newState = _ref.state,
        actionName = _ref.actionName;
    var stateHasNoChange = currentModules[moduleName].state === newState;

    if (stateHasNoChange) {
      return newState;
    }

    currentModules[moduleName].state = newState;
    mapsCacheShouldCheckForValid(moduleName);
    runListeners(moduleName, {
      type: 'update',
      actionName: actionName
    });
    return currentModules[moduleName].state;
  };

  var globalSetStates = function globalSetStates(states) {
    Object.keys(states).forEach(function (moduleName) {
      if (hasModule(moduleName)) {
        if (!setStateProxyWithMiddlewareCache[moduleName]) {
          createDispatch(moduleName);
        }

        setStateProxyWithMiddlewareCache[moduleName]({
          moduleName: moduleName,
          actionName: 'globalSetStates',
          state: states[moduleName]
        });
      } else {
        currentInitStates[moduleName] = states[moduleName];
      }
    });
  };

  var globalResetStates = function globalResetStates(_temp) {
    var _ref2 = _temp === void 0 ? {} : _temp,
        include = _ref2.include,
        exclude = _ref2.exclude;

    var shouldResetModuleNames = Object.keys(resetStateData).filter(hasModule);

    if (exclude) {
      var stringExclude = exclude.filter(function (ex) {
        return typeof ex === 'string';
      });
      var regExpExclude = exclude.filter(function (ex) {
        return typeof ex !== 'string';
      }); // 过滤不需要重制状态的模块

      shouldResetModuleNames = shouldResetModuleNames.filter(function (mn) {
        return stringExclude.indexOf(mn) === -1 && !regExpExclude.some(function (reg) {
          return reg.test(mn);
        });
      });
    }

    if (include) {
      var stringInclude = include.filter(function (ex) {
        return typeof ex === 'string';
      });
      var regExpInclude = include.filter(function (ex) {
        return typeof ex !== 'string';
      }); // 如果存在include配置，则只重制include配置中的模块

      shouldResetModuleNames = shouldResetModuleNames.filter(function (mn) {
        return stringInclude.indexOf(mn) > -1 || regExpInclude.some(function (reg) {
          return reg.test(mn);
        });
      });
    }

    shouldResetModuleNames.forEach(function (mn) {
      if (!setStateProxyWithMiddlewareCache[mn]) {
        createDispatch(mn);
      }

      setStateProxyWithMiddlewareCache[mn]({
        moduleName: mn,
        actionName: 'globalResetStates',
        state: resetStateData[mn]
      });
    });
  }; // 修改module


  var setModule = function setModule(moduleName, storeModule) {
    var _objectSpread2;

    if (!isStoreModule(storeModule)) {
      var errMsg = "setModule: storeModule " + moduleName + " is illegal!";
      console.error(errMsg);
      throw new Error(errMsg);
    }

    var isModuleExist = hasModule(moduleName);
    currentModules = _objectSpread({}, currentModules, (_objectSpread2 = {}, _objectSpread2[moduleName] = replaceModule(moduleName, storeModule), _objectSpread2));

    if (isModuleExist) {
      clearAllCache(moduleName);
    } else {
      allModuleNames = undefined;
    }

    if (!mapsCache[moduleName]) {
      mapsCache[moduleName] = {};
      mapsCacheList[moduleName] = [];
    }

    runListeners(moduleName, {
      type: 'init'
    });
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
    runListeners(moduleName, {
      type: 'remove'
    });
    return currentStoreInstance;
  };

  var setLazyModule = function setLazyModule(moduleName, lazyModule) {
    allModuleNames = undefined;
    currentLazyModules[moduleName] = lazyModule;
    return currentStoreInstance;
  };

  var removeLazyModule = function removeLazyModule(moduleName) {
    allModuleNames = undefined;
    delete currentLazyModules[moduleName];
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
          mapsCache[moduleName][key] = new MapCache(function () {
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
    };
    return proxyModule;
  };
  /**
   *
   * @param action count/inc
   */


  var dispatch = function dispatch(action) {
    if (!/\//.test(action)) {
      console.warn("dispatch: " + action + " is invalid!");
      throw new Error("dispatch: " + action + " is invalid!");
    }

    var slashIndex = action.indexOf('/');
    var moduleName = action.substr(0, slashIndex);
    var actionName = action.substr(slashIndex + 1);
    checkModuleIsValid(moduleName);
    var moduleProxyActions = createActionsProxy(moduleName);

    if (!(actionName in moduleProxyActions)) {
      console.warn("dispatch: " + action + " is invalid!");
      throw new Error("dispatch: " + action + " is invalid!");
    }

    ;

    for (var _len2 = arguments.length, arg = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      arg[_key2 - 1] = arguments[_key2];
    }

    return moduleProxyActions[actionName].apply(moduleProxyActions, arg);
  }; // 获取原本的module


  var getOriginModule = function getOriginModule(moduleName) {
    checkModuleIsValid(moduleName);
    return currentModules[moduleName];
  };

  var getLazyModule = function getLazyModule(moduleName) {
    if (!!currentLazyModules[moduleName]) {
      return currentLazyModules[moduleName];
    }

    var errMsg = "getLazyModule: " + moduleName + " is not exist";
    console.error(errMsg);
    throw new Error(errMsg);
  };

  var loadModule = function loadModule(moduleName) {
    if (hasModule(moduleName)) {
      return Promise.resolve(getModule(moduleName));
    }

    return getLazyModule(moduleName)().then(function (loadedModule) {
      setModule(moduleName, loadedModule);
      return getModule(moduleName);
    });
  };

  var createDispatch = function createDispatch(moduleName) {
    checkModuleIsValid(moduleName);
    var middlewareParams = {
      setState: setState,
      getState: function getState() {
        return currentModules[moduleName].state;
      },
      getMaps: function getMaps() {
        return createMapsProxy(moduleName);
      },
      dispatch: dispatch
    };
    var chain = currentMiddlewares.map(function (middleware) {
      return middleware(middlewareParams);
    });
    var setStateProxyWithMiddleware = compose.apply(void 0, chain)(setState);
    setStateProxyWithMiddlewareCache[moduleName] = setStateProxyWithMiddleware;
    return function (type) {
      var _targetModule$actions;

      checkModuleIsValid(moduleName);
      var newState;
      var targetModule = currentModules[moduleName];

      for (var _len3 = arguments.length, data = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        data[_key3 - 1] = arguments[_key3];
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
      if (Array.isArray(listeners[moduleName])) {
        listeners[moduleName] = listeners[moduleName].filter(function (lis) {
          return listener !== lis;
        });
      }
    };
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
    getOriginModule: getOriginModule,
    getLazyModule: getLazyModule,
    loadModule: loadModule,
    setModule: setModule,
    removeModule: removeModule,
    hasModule: hasModule,
    setLazyModule: setLazyModule,
    removeLazyModule: removeLazyModule,
    subscribe: subscribe,
    destory: destory,
    dispatch: dispatch,
    globalSetStates: globalSetStates,
    globalResetStates: globalResetStates
  };
  return currentStoreInstance;
};

export var getStoreInstance = function getStoreInstance() {
  return currentStoreInstance;
};
export default createStore;