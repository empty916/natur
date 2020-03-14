import { useState, useCallback, useEffect } from 'react';
import { getStoreInstance } from './createStore';
import { isModuleDepDec, initDiff } from './utils';
var _getStoreInstance = getStoreInstance;
export function useInject() {
  for (var _len = arguments.length, moduleDec = new Array(_len), _key = 0; _key < _len; _key++) {
    moduleDec[_key] = arguments[_key];
  }

  var store = _getStoreInstance();

  var _useState = useState(function () {
    var depDecs = {};
    var moduleNames = moduleDec.map(function (m) {
      if (isModuleDepDec(m)) {
        depDecs[m[0]] = m[1];
        return m[0];
      }

      return m;
    });

    if (moduleNames.length === 0) {
      var errMsg = 'useInject: moduleNames param is required!';
      console.error(errMsg);
      throw new Error(errMsg);
    }

    var allModuleNames = store.getAllModuleName(); // 获取store中不存在的模块

    var invalidModulesNames = moduleNames.filter(function (mn) {
      return !allModuleNames.includes(mn);
    });

    if (!!invalidModulesNames.length) {
      var _errMsg = "useInject: " + invalidModulesNames.join() + " module is not exits!";

      console.error(_errMsg);
      throw new Error(_errMsg);
    }

    var _initDiff = initDiff(depDecs, store),
        diff = _initDiff.diff,
        destroy = _initDiff.destroy; // this.storeModuleDiff = diff;
    // this.destoryCache = destroy;


    return {
      $depDecs: depDecs,
      $moduleNames: moduleNames,
      diff: diff,
      destroy: destroy
    };
  }),
      _useState$ = _useState[0],
      $depDecs = _useState$.$depDecs,
      $moduleNames = _useState$.$moduleNames,
      diff = _useState$.diff,
      destroy = _useState$.destroy;

  var _useState2 = useState({}),
      stateChanged = _useState2[0],
      setStateChanged = _useState2[1]; // 获取moduleNames中是否存在未加载的模块


  var unLoadedModules = $moduleNames.filter(function (mn) {
    return !store.hasModule(mn);
  });
  var hasUnloadModules = !!unLoadedModules.length;
  var $setStateChanged = useCallback(function (moduleName) {
    if (!$depDecs[moduleName]) {
      setStateChanged({});
    } else if (diff) {
      var hasDepChanged = diff[moduleName].some(function (diff) {
        diff.shouldCheckCache();
        return diff.hasDepChanged();
      });

      if (hasDepChanged) {
        setStateChanged({});
      }
    } else {
      setStateChanged({});
    }
  }, [setStateChanged]); // 初始化store监听

  useEffect(function () {
    var unsubscribes = $moduleNames.map(function (mn) {
      return store.subscribe(mn, function () {
        return $setStateChanged(mn);
      });
    });
    return function () {
      destroy();
      unsubscribes.forEach(function (fn) {
        return fn();
      });
    };
  }, []);
  useEffect(function () {
    // 动态加载moduleName中还未加载的模块
    if (hasUnloadModules) {
      Promise.all(unLoadedModules.map(function (mn) {
        return store.loadModule(mn);
      })).then(function () {
        return setStateChanged({});
      })["catch"](function () {
        return setStateChanged({});
      });
    }
  }, [hasUnloadModules]); // 计算moduleName对应的store、action,放入props中

  if (hasUnloadModules) {
    console.log('store module is loading.');
    return [];
  }

  return $moduleNames.reduce(function (res, mn) {
    res.push(store.getModule(mn));
    return res;
  }, []);
}

useInject.setStoreGetter = function (storeGetter) {
  _getStoreInstance = storeGetter;
};