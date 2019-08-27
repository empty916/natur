"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _hoistNonReactStatics = _interopRequireDefault(require("hoist-non-react-statics"));

var _createStore = require("./createStore");

var _isEqualWithDepthLimit = _interopRequireDefault(require("./isEqualWithDepthLimit"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

var Loading = function Loading() {
  return null;
};

var createLoadModulesPromise = function createLoadModulesPromise(moduleNames) {
  return moduleNames.map(function (mn) {
    return (0, _createStore.getStoreInstance)().getLazyModule(mn)();
  });
}; // type GetModuleProps<
// 	P extends {[p: string]: any},
// 	ModuleKeys = (keyof P)[],
// 	// MKI = keyof ModuleKeys,
// 	MK = {[K in keyof ModuleKeys]: ModuleKeys[K]},
// > = {[K in ModuleKeys]: ModuleKeys[K]};


var connect = function connect(moduleNames, WrappedComponent) {
  var LoadingComponent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Loading;

  // const store = getStoreInstance();
  // if (store === undefined) {
  // 	throw new Error('\n 请先创建store实例！\n Please create a store instance first.');
  // }
  // const allModuleNames = store.getAllModuleName();
  // // 获取store中存在的模块
  // const integralModulesName = moduleNames.filter(mn => allModuleNames.includes(mn));
  var Connect = // <FPNoRef extends NoRefP & {forwardedRef: React.Ref<unknown>}>
  function Connect(_ref) {
    var forwardedRef = _ref.forwardedRef,
        props = _objectWithoutProperties(_ref, ["forwardedRef"]);

    // (props: P) => {
    var newProps = _objectSpread({}, props, {
      ref: forwardedRef
    });

    var _useMemo = (0, _react.useMemo)(function () {
      var store = (0, _createStore.getStoreInstance)();

      if (store === undefined) {
        throw new Error('\n 请先创建store实例！\n Please create a store instance first.');
      }

      var allModuleNames = store.getAllModuleName(); // 获取store中存在的模块

      var integralModulesName = moduleNames.filter(function (mn) {
        return allModuleNames.includes(mn);
      });
      return {
        store: store,
        integralModulesName: integralModulesName
      };
    }, [moduleNames]),
        store = _useMemo.store,
        integralModulesName = _useMemo.integralModulesName;

    if (!integralModulesName.length) {
      console.warn("modules: ".concat(moduleNames.join(), " is not exits!"));
      console.warn("".concat(moduleNames.join(), " \u6A21\u5757\u4E0D\u5B58\u5728!"));
      return _react["default"].createElement(WrappedComponent, newProps);
    }

    var _useState = (0, _react.useState)({}),
        _useState2 = _slicedToArray(_useState, 2),
        stateChanged = _useState2[0],
        setStateChanged = _useState2[1]; // 获取moduleNames中是否存在未加载的模块


    var unLoadedModules = integralModulesName.filter(function (mn) {
      return !store.hasModule(mn);
    });

    var _useState3 = (0, _react.useState)(!unLoadedModules.length),
        _useState4 = _slicedToArray(_useState3, 2),
        modulesHasLoaded = _useState4[0],
        setModulesHasLoaded = _useState4[1];

    var $setStateChanged = (0, _react.useCallback)(function () {
      return setStateChanged({});
    }, [setStateChanged]); // console.log(a);

    (0, _react.useEffect)(function () {
      var unsubscribes = integralModulesName.map(function (mn) {
        return store.subscribe(mn, $setStateChanged);
      });
      return function () {
        return unsubscribes.forEach(function (fn) {
          return fn();
        });
      };
    }, []);
    (0, _react.useEffect)(function () {
      // 动态加载moduleName中还未加载的模块
      if (!modulesHasLoaded) {
        var loadModulesPromise = createLoadModulesPromise(unLoadedModules);
        Promise.all(loadModulesPromise).then(function (modules) {
          modules.forEach(function (_ref2, index) {
            var state = _ref2.state,
                actions = _ref2.actions,
                maps = _ref2.maps;
            return store.addModule(unLoadedModules[index], {
              state: _objectSpread({}, state),
              actions: actions,
              maps: maps
            });
          });
          setModulesHasLoaded(true);
        })["catch"](function (e) {
          setModulesHasLoaded(false);
        });
      }
    }, []); // 计算moduleName对应的store、action,放入props中

    var injectModules = (0, _react.useMemo)(function () {
      if (modulesHasLoaded) {
        return integralModulesName.reduce(function (res, mn) {
          return _objectSpread({}, res, _defineProperty({}, mn, store.getModule(mn)));
        }, {});
      }

      return {};
    }, [modulesHasLoaded, stateChanged]);
    newProps = _objectSpread({}, newProps, {}, injectModules);
    var $props = (0, _react.useRef)(props); // const $injectModules = useRef(injectModules);

    var stabelProps = (0, _react.useMemo)(function () {
      /**
       * why is depth 3?
       * because the router props will be:
       * props: {
       * 		// depth: 1
       * 		match: {
       * 			// depth: 2
       * 			params: { // and this one will be change every times;
       * 				// depth: 3,
       * 			},
       * 		}
       * }
       */
      var propsChanged = !(0, _isEqualWithDepthLimit["default"])($props.current, props, 3);

      if (propsChanged) {
        $props.current = props;
      }

      return $props.current;
    }, [props]); //  ref={forwardedRef}

    var render = (0, _react.useMemo)(function () {
      return _react["default"].createElement(WrappedComponent, newProps);
    }, // [props, injectModules]
    [stabelProps, injectModules]); // console.log(performance.now() - s);

    return modulesHasLoaded ? render : _react["default"].createElement(LoadingComponent, null);
  }; // const ConnectWithStatics = hoistStatics(Connect as React.FC<P>, WrappedComponent, undefined);


  var MemoConnect = _react["default"].memo(Connect);

  MemoConnect.displayName = 'Connect'; // Pick<P, Exclude<keyof P, 'ref'>>

  var forwardedConnect = _react["default"].forwardRef(function (props, ref) {
    return _react["default"].createElement(Connect, _extends({}, props, {
      forwardedRef: ref
    }));
  }); // forwardedConnect.displayName = 'forwardedConnect';
  // (forwardedConnect as any).WrappedComponent = WrappedComponent;


  return (0, _hoistNonReactStatics["default"])(forwardedConnect, WrappedComponent); // return MemoConnect as React.FC<P>;
};

var Inject = function Inject() {
  for (var _len = arguments.length, moduleNames = new Array(_len), _key = 0; _key < _len; _key++) {
    moduleNames[_key] = arguments[_key];
  }

  return function (WrappedComponent, LoadingComponent) {
    return connect(moduleNames, WrappedComponent, LoadingComponent);
  };
};

Inject.setLoadingComponent = function (LoadingComponent) {
  return Loading = LoadingComponent;
};

var _default = Inject;
exports["default"] = _default;