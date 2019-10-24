"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useInject = useInject;

var _react = require("react");

var _createStore = require("./createStore");

var _utils = require("./utils");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var createLoadModulesPromise = function createLoadModulesPromise(moduleNames, store) {
  return moduleNames.map(function (mn) {
    return store.getLazyModule(mn)();
  });
};

function useInject() {
  for (var _len = arguments.length, moduleNames = new Array(_len), _key = 0; _key < _len; _key++) {
    moduleNames[_key] = arguments[_key];
  }

  if (moduleNames.length === 0) {
    throw new Error('useInject: moduleNames param is required!');
  }

  var _useState = (0, _react.useState)(moduleNames),
      _useState2 = _slicedToArray(_useState, 2),
      $moduleNames = _useState2[0],
      setModuleNames = _useState2[1];

  if (!(0, _utils.isEqualWithDepthLimit)(moduleNames.slice().sort(), $moduleNames.slice().sort(), 1)) {
    setModuleNames(moduleNames);
  }

  var store = (0, _createStore.getStoreInstance)();
  var allModuleNames = store.getAllModuleName(); // 获取store中不存在的模块

  var invalidModulesNames = $moduleNames.filter(function (mn) {
    return !allModuleNames.includes(mn);
  });

  if (!!invalidModulesNames.length) {
    console.error("useInject: ".concat(invalidModulesNames.join(), " module is not exits!"));
    return [];
  }

  var _useState3 = (0, _react.useState)({}),
      _useState4 = _slicedToArray(_useState3, 2),
      stateChanged = _useState4[0],
      setStateChanged = _useState4[1]; // 获取moduleNames中是否存在未加载的模块


  var unLoadedModules = $moduleNames.filter(function (mn) {
    return !store.hasModule(mn);
  });
  var hasUnloadModules = !!unLoadedModules.length;
  var $setStateChanged = (0, _react.useCallback)(function () {
    return setStateChanged({});
  }, [setStateChanged]); // 初始化store监听

  (0, _react.useEffect)(function () {
    var unsubscribes = $moduleNames.map(function (mn) {
      return store.subscribe(mn, $setStateChanged);
    });
    return function () {
      return unsubscribes.forEach(function (fn) {
        return fn();
      });
    };
  }, [$moduleNames]);
  (0, _react.useEffect)(function () {
    // 动态加载moduleName中还未加载的模块
    if (hasUnloadModules) {
      var loadModulesPromise = createLoadModulesPromise(unLoadedModules, store);
      Promise.all(loadModulesPromise).then(function (modules) {
        modules.forEach(function (storeModule, index) {
          return store.setModule(unLoadedModules[index], storeModule);
        });
        setStateChanged({});
      })["catch"](function (e) {
        setStateChanged({});
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