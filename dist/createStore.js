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
import { compose, isStoreModule } from "./utils";
import MapCache from "./MapCache";
/**
 *
 * @param modules 同步模块, 你的store模块
 * @param lazyModules 懒加载模块， 必填，如果没有可以传{}, 如果不填，那么ts的类型推断会有问题
 * @param param2 选项配置，详情见文档
 */

var createStore = function createStore(modules, lazyModules, _temp) {
  if (modules === void 0) {
    modules = {};
  }

  var _ref = _temp === void 0 ? {} : _temp,
      _ref$initStates = _ref.initStates,
      initStates = _ref$initStates === void 0 ? {} : _ref$initStates,
      _ref$middlewares = _ref.middlewares,
      middlewares = _ref$middlewares === void 0 ? [] : _ref$middlewares,
      _ref$interceptors = _ref.interceptors,
      interceptors = _ref$interceptors === void 0 ? [] : _ref$interceptors;

  var t = _objectSpread(_objectSpread({}, modules), lazyModules);
  /**
   * 存放store实例
   */


  var currentStoreInstance;
  /**
   * 存放createStore构造函数传入的全局初始化state
   */

  var currentInitStates = _objectSpread({}, initStates);
  /**
   * 存放着每个模块最初的state数据
   * 用于globalResetStates方法重置store中的所有state
   */


  var resetStateData = {};
  /**
   * 主要存放，已经加载的store的state，maps，actions
   * 这里存放的是原始的maps，actions，并非经过代理后的maps和actions，或者说并非是natur使用者获取的maps和actions
   */

  var currentModules = {};
  /**
   * 懒加载模块配置
   */

  var currentLazyModules = _objectSpread({}, lazyModules);
  /**
   * 监听器对象
   * key是模块的名字
   * value是存放该模块对应的监听器的数组
   * 在模块的state变更，模块的删除，初始化时，会通知对应的监听器
   */


  var listeners = {};
  /**
   * 存放所有模块的名字
   */

  var allModuleNames;
  /**
   * 存放createStore中传入的middlewares配置
   */

  var currentMiddlewares = [].concat(middlewares);
  var currentInterceptors = [].concat(interceptors);
  /**
   * 这是一个缓存，用于存放，每个模块对应的setState代理
   * 在每个模块生成对应的action代理时，会产生一个setState的方法，
   * 这个setState是用于改变对应模块的state的
   * 同时这个setState会使用洋葱模型包装好middlewares，所以在调用setState时，会先调用middlewares
   */

  var setStateProxyWithMiddlewareCache = {};
  /**
   * 存放每个模块对应的actions代理缓存
   * natur使用者获取的action并非原始的action，而是代理的action
   * 代理action调用后可以经过中间件，然后将返回值作为新的state更新，并通知对应的监听器
   * 在getModule中生成action代理是有性能消耗的，所以需要加一个缓存
   * 那么保证action代理生成后，下一次getModule可以一直使用上一次生成过的action代理
   * 所以你获取的action代理会一直相同，这在react的性能优化时也同样有用
   */

  var actionsProxyCache = {};
  var mapsCache = {};
  /**
   * 与mapsCache一样是maps的缓存
   * 但是数据结构不同，mapsCache第二层的key是模块对应的maps中的key，这里则是一个数组，方便做循环遍历使用
   */

  var mapsCacheList = {};
  /**
   * 此方法使用在setModule中，
   * 使用createStore中的初始化的state，来替换待加载模块的state数据
   * @param moduleName 模块名
   * @param storeModule 待加载模块的原始数据
   */

  var replaceModule = function replaceModule(moduleName, storeModule) {
    var res; // 缓存每个模块的初始化状态，供globalResetStates使用

    resetStateData[moduleName] = storeModule.state;

    if (!!currentInitStates[moduleName]) {
      res = _objectSpread(_objectSpread({}, storeModule), {}, {
        state: currentInitStates[moduleName]
      });
      delete currentInitStates[moduleName];
    } else {
      res = _objectSpread({}, storeModule);
    }

    return res;
  };
  /**
   * 查看该模块是否已经加载
   * @param moduleName 模块名
   */


  var hasModule = function hasModule(moduleName) {
    return !!currentModules[moduleName];
  };
  /**
   * 查看该模块是否已经加载，如果没有则报错
   * @param moduleName 模块名
   */


  var checkModuleIsValid = function checkModuleIsValid(moduleName) {
    if (!hasModule(moduleName)) {
      var errMsg = "module: " + moduleName + " is not valid!";
      console.error(errMsg);
      throw new Error(errMsg);
    }
  };
  /**
   * 删除一个模块的action proxy缓存
   * @param moduleName 模块名
   */


  var clearActionsProxyCache = function clearActionsProxyCache(moduleName) {
    delete actionsProxyCache[moduleName];
  };
  /**
   * 删除一个模块的map proxy缓存
   * @param moduleName 模块名
   */


  var clearMapsProxyCache = function clearMapsProxyCache(moduleName) {
    delete mapsCache[moduleName];
    mapsCacheList[moduleName].forEach(function (i) {
      return i.destroy();
    });
    delete mapsCacheList[moduleName];
  };
  /**
   * 当模块对应的state更新时，需要通知该模块的maps缓存，state已经改变
   * 所以在下一次获取maps的值时，应该先看看maps的依赖有没有变化，
   * @param moduleName
   */


  var mapsCacheShouldCheckForValid = function mapsCacheShouldCheckForValid(moduleName) {
    mapsCacheList[moduleName].forEach(function (i) {
      return i.shouldCheckCache();
    });
  };
  /**
   * 清除setStateProxyWithMiddlewareCache对应模块的缓存
   * @param moduleName
   */


  var clearSetStateProxyWithMiddlewareCache = function clearSetStateProxyWithMiddlewareCache(moduleName) {
    delete setStateProxyWithMiddlewareCache[moduleName];
  };
  /**
   * 清除模块对应的一切缓存
   * @param moduleName 模块名
   */


  var clearAllCache = function clearAllCache(moduleName) {
    clearMapsProxyCache(moduleName);
    clearActionsProxyCache(moduleName);
    clearSetStateProxyWithMiddlewareCache(moduleName);
  };
  /**
   * 获取所有模块的名字，包括懒加载模块的名字
   */


  var getAllModuleName = function getAllModuleName() {
    if (!allModuleNames) {
      allModuleNames = Object.keys(_objectSpread(_objectSpread({}, currentModules), currentLazyModules));
    }

    return allModuleNames;
  };
  /**
   * 模块发生变动，通知对应的监听器
   * @param moduleName
   * @param me 模块变动的详情
   */


  var runListeners = function runListeners(moduleName, me) {
    return Array.isArray(listeners[moduleName]) && listeners[moduleName].forEach(function (listener) {
      return listener(me);
    });
  };
  /**
   * 用于更新模块对应的state，并发出通知
   * 通知模块监听器
   * 通知模块中的maps缓存state更新了
   * 如果新的state全等于旧的state则不会触发更新
   * @param param0
   */


  var setState = function setState(_ref2) {
    var moduleName = _ref2.moduleName,
        newState = _ref2.state,
        actionName = _ref2.actionName;
    var stateHasNoChange = currentModules[moduleName].state === newState;

    if (stateHasNoChange) {
      return newState;
    }

    currentModules[moduleName].state = newState;
    mapsCacheShouldCheckForValid(moduleName);
    runListeners(moduleName, {
      type: "update",
      actionName: actionName
    });
    return currentModules[moduleName].state;
  };
  /**
   * 全局统一设置state
   * 主要的应用场景是，异步加载所有的state配置时，需要更新到对应的模块中
   * 更新会走中间件，中间中的actionName参数是'globalSetStates'
   * @param states
   */


  var globalSetStates = function globalSetStates(states) {
    Object.keys(states).forEach(function (moduleName) {
      if (hasModule(moduleName)) {
        if (!setStateProxyWithMiddlewareCache[moduleName]) {
          createDispatch(moduleName);
        }

        setStateProxyWithMiddlewareCache[moduleName]({
          moduleName: moduleName,
          actionName: "globalSetStates",
          state: states[moduleName]
        });
      } else {
        currentInitStates[moduleName] = states[moduleName];
      }
    });
  };
  /**
   * 全局统一重置state
   * 主要的应用场景是，ssr不需要重新createStore只需要重置一下state就行，或者在业务中退出登录后需要清空数据
   * 更新会走中间件，中间中的actionName参数是'globalResetStates'
   * 可以配置include：只重置哪些模块
   * 可以配置exclude：不重置哪些模块
   * exclude优先级大于include
   * @param states
   */


  var globalResetStates = function globalResetStates(_temp2) {
    var _ref3 = _temp2 === void 0 ? {} : _temp2,
        include = _ref3.include,
        exclude = _ref3.exclude;

    var shouldResetModuleNames = Object.keys(resetStateData).filter(hasModule);

    if (exclude) {
      var stringExclude = exclude.filter(function (ex) {
        return typeof ex === "string";
      });
      var regExpExclude = exclude.filter(function (ex) {
        return typeof ex !== "string";
      }); // 过滤不需要重制状态的模块

      shouldResetModuleNames = shouldResetModuleNames.filter(function (mn) {
        return stringExclude.indexOf(mn) === -1 && !regExpExclude.some(function (reg) {
          return reg.test(mn);
        });
      });
    }

    if (include) {
      var stringInclude = include.filter(function (ex) {
        return typeof ex === "string";
      });
      var regExpInclude = include.filter(function (ex) {
        return typeof ex !== "string";
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
        actionName: "globalResetStates",
        state: resetStateData[mn]
      });
    });
  };
  /**
   * 设置模块
   * 如果该模块已经存在，则覆盖旧的模块，并清空就模块的缓存
   * 最后通知监听器
   * @param moduleName 模块名
   * @param storeModule 模块的原始数据
   */


  var setModule = function setModule(moduleName, storeModule) {
    var _objectSpread2;

    if (!isStoreModule(storeModule)) {
      var errMsg = "setModule: storeModule " + moduleName + " is illegal!";
      console.error(errMsg);
      throw new Error(errMsg);
    }

    var isModuleExist = hasModule(moduleName);
    currentModules = _objectSpread(_objectSpread({}, currentModules), {}, (_objectSpread2 = {}, _objectSpread2[moduleName] = replaceModule(moduleName, storeModule), _objectSpread2));

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
      type: "init"
    });
    return currentStoreInstance;
  };
  /**
   * 销毁模块，清空缓存以及对应的原始数据
   * @param moduleName
   */


  var destoryModule = function destoryModule(moduleName) {
    delete currentModules[moduleName];
    delete currentLazyModules[moduleName];
    allModuleNames = undefined;
    clearAllCache(moduleName);
  };
  /**
   * 移除模块，会调用destoryModule，并发送通知
   * @param moduleName
   */


  var removeModule = function removeModule(moduleName) {
    destoryModule(moduleName);
    runListeners(moduleName, {
      type: "remove"
    });
    return currentStoreInstance;
  };
  /**
   * 设置懒加载模块
   * @param moduleName
   * @param lazyModule
   */


  var setLazyModule = function setLazyModule(moduleName, lazyModule) {
    allModuleNames = undefined;
    currentLazyModules[moduleName] = lazyModule;
    return currentStoreInstance;
  };
  /**
   * 移除懒加载模块
   * @param moduleName
   */


  var removeLazyModule = function removeLazyModule(moduleName) {
    allModuleNames = undefined;
    delete currentLazyModules[moduleName];
    return currentStoreInstance;
  };
  /**
   * 计算maps的值，如果首次获取maps则会先建立缓存对象
   * @param moduleName
   */


  var createMapsProxy = function createMapsProxy(moduleName) {
    var maps = currentModules[moduleName].maps;

    if (maps === undefined) {
      return undefined;
    }

    var proxyMaps = {};

    for (var key in maps) {
      if (maps.hasOwnProperty(key)) {
        if (mapsCache[moduleName][key] === undefined) {
          var targetMap = maps[key];
          var mapCacheSecondParam = [];

          if (Array.isArray(targetMap)) {
            mapCacheSecondParam = targetMap;
          } else if (targetMap.length !== 0) {
            mapCacheSecondParam = [function () {
              return currentModules[moduleName].state;
            }, targetMap];
          } else {
            mapCacheSecondParam = [function () {
              return undefined;
            }, targetMap];
          }

          mapsCache[moduleName][key] = new MapCache(function () {
            return currentModules[moduleName].state;
          }, mapCacheSecondParam);
          mapsCacheList[moduleName].push(mapsCache[moduleName][key]);
        }

        var targetWatcher = mapsCache[moduleName][key];
        proxyMaps[key] = targetWatcher.getValue();
      }
    }

    return proxyMaps;
  };
  /**
   * 创建action代理
   * @param moduleName
   */


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
  };
  /**
   * 获取module
   * @param moduleName
   */


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
   * 执行对应模块对应的action
   * @param moduleName
   * @param actionName
   */


  var dispatch = function dispatch(moduleName, actionName) {
    checkModuleIsValid(moduleName);

    if (hasModule(moduleName)) {
      var moduleProxyActions = createActionsProxy(moduleName);

      if (actionName in moduleProxyActions) {
        for (var _len2 = arguments.length, arg = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
          arg[_key2 - 2] = arguments[_key2];
        }

        return moduleProxyActions[actionName].apply(moduleProxyActions, arg);
      }
    }

    return undefined;
  };
  /**
   * 获取原始的module数据
   * @param moduleName
   */


  var getOriginModule = function getOriginModule(moduleName) {
    checkModuleIsValid(moduleName);
    return currentModules[moduleName];
  };
  /**
   * 获取某个懒加载模块
   * @param moduleName
   */


  var getLazyModule = function getLazyModule(moduleName) {
    if (!!currentLazyModules[moduleName]) {
      return currentLazyModules[moduleName];
    }

    var errMsg = "getLazyModule: " + moduleName + " is not exist";
    console.error(errMsg);
    throw new Error(errMsg);
  };
  /**
   * 加载某个懒加载模块，如果已经加载就返回以及加载的模块
   * @param moduleName
   */


  var loadModule = function loadModule(moduleName) {
    if (hasModule(moduleName)) {
      return Promise.resolve(getModule(moduleName));
    }

    return getLazyModule(moduleName)().then(function (loadedModule) {
      if (isStoreModule(loadedModule)) {
        setModule(moduleName, loadedModule);
      } else if (isStoreModule(loadedModule["default"])) {
        setModule(moduleName, loadedModule["default"]);
      }

      return getModule(moduleName);
    });
  };

  var runAcion = function runAcion(_ref4) {
    var _targetModule$actions;

    var moduleName = _ref4.moduleName,
        actionName = _ref4.actionName,
        actionArgs = _ref4.actionArgs;
    checkModuleIsValid(moduleName);
    var targetModule = currentModules[moduleName];
    return (_targetModule$actions = targetModule.actions)[actionName].apply(_targetModule$actions, actionArgs);
  };
  /**
   * 创建dispath
   * 这里是拼接filter，action，middleware，setState的地方
   * @param moduleName
   */


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
    var middlewareChain = currentMiddlewares.map(function (middleware) {
      return middleware(middlewareParams);
    });
    var setStateProxyWithMiddleware = compose.apply(void 0, middlewareChain)(setState);
    var filterChain = currentInterceptors.map(function (middleware) {
      return middleware(middlewareParams);
    });
    var runActionProxyWithInterceptors = compose.apply(void 0, filterChain)(function (filterRecord) {
      return setStateProxyWithMiddleware({
        moduleName: moduleName,
        actionName: filterRecord.actionName,
        state: runAcion(filterRecord)
      });
    });
    setStateProxyWithMiddlewareCache[moduleName] = setStateProxyWithMiddleware;
    return function (actionName) {
      for (var _len3 = arguments.length, actionArgs = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        actionArgs[_key3 - 1] = arguments[_key3];
      }

      return runActionProxyWithInterceptors({
        moduleName: moduleName,
        actionName: actionName,
        actionArgs: actionArgs,
        actionFunc: currentModules[moduleName]['actions'][actionName]
      });
    };
  };
  /**
   * 监听某个模块
   * @param moduleName
   * @param listener
   */


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
  /**
   * 销毁store
   */


  var destroy = function destroy() {
    Object.keys(currentModules).forEach(destoryModule);
    currentInitStates = {};
    currentLazyModules = {};
    listeners = {};
    allModuleNames = undefined;
    currentMiddlewares = [];
    currentInterceptors = [];
  };
  /**
   * 初始化store
   */


  var init = function init() {
    Object.keys(modules).forEach(function (moduleName) {
      setModule(moduleName, modules[moduleName]);
    });
  };
  /**
   * 获取所有state
   * key是模块名
   * value是模块对应的值
   */


  var getAllStates = function getAllStates() {
    return Object.keys(currentModules).reduce(function (as, key) {
      as[key] = currentModules[key].state;
      return as;
    }, {});
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
    destroy: destroy,
    dispatch: dispatch,
    globalSetStates: globalSetStates,
    globalResetStates: globalResetStates,
    getAllStates: getAllStates,
    type: null
  };
  return currentStoreInstance;
};

export default createStore;