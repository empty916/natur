"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _hoistNonReactStatics = _interopRequireDefault(require("hoist-non-react-statics"));

var _createStore = require("./createStore");

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Loading = function Loading() {
  return null;
};

var createLoadModulesPromise = function createLoadModulesPromise(moduleNames, store) {
  return moduleNames.map(function (mn) {
    return store.getLazyModule(mn)();
  });
};

var connect = function connect(moduleNames, WrappedComponent, LoadingComponent) {
  var Connect =
  /*#__PURE__*/
  function (_React$Component) {
    _inherits(Connect, _React$Component);

    function Connect(props, state) {
      var _this;

      _classCallCheck(this, Connect);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Connect).call(this, props, state));
      _this.injectModules = {};

      _this.unsubStore = function () {};

      _this.state = {
        storeStateChange: {},
        modulesHasLoaded: false
      }; // 初始化store, integralModulesName(合法模块名)

      var _this$init = _this.init(),
          store = _this$init.store,
          integralModulesName = _this$init.integralModulesName;

      _this.store = store;
      _this.integralModulesName = integralModulesName;
      var unLoadedModules = integralModulesName.filter(function (mn) {
        return !store.hasModule(mn);
      });
      _this.unLoadedModules = unLoadedModules; // 初始化模块是否全部加载完成标记

      _this.state.modulesHasLoaded = !unLoadedModules.length;
      _this.setStoreStateChanged = _this.setStoreStateChanged.bind(_assertThisInitialized(_this));
      _this.LoadingComponent = LoadingComponent || Loading;
      return _this;
    }

    _createClass(Connect, [{
      key: "setStoreStateChanged",
      value: function setStoreStateChanged() {
        this.setState({
          storeStateChange: {}
        });
      }
    }, {
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this2 = this;

        var store = this.store,
            integralModulesName = this.integralModulesName,
            unLoadedModules = this.unLoadedModules,
            setStoreStateChanged = this.setStoreStateChanged;
        var modulesHasLoaded = this.state.modulesHasLoaded; // 初始化store监听

        var unsubscribes = integralModulesName.map(function (mn) {
          return store.subscribe(mn, setStoreStateChanged);
        });

        this.unsubStore = function () {
          return unsubscribes.forEach(function (fn) {
            return fn();
          });
        };

        if (!modulesHasLoaded) {
          var loadModulesPromise = createLoadModulesPromise(unLoadedModules, store);
          Promise.all(loadModulesPromise).then(function (modules) {
            modules.forEach(function (storeModule, index) {
              return store.setModule(unLoadedModules[index], storeModule);
            });

            _this2.setState({
              modulesHasLoaded: true
            });
          })["catch"](function (e) {
            _this2.setState({
              modulesHasLoaded: false
            });
          });
        }
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        this.unsubStore();

        this.unsubStore = function () {};
      }
    }, {
      key: "shouldComponentUpdate",
      value: function shouldComponentUpdate(nextProps, nextState) {
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
        var propsChanged = !(0, _utils.isEqualWithDepthLimit)(this.props, nextProps, 3);
        var stateChanged = nextState.modulesHasLoaded !== this.state.modulesHasLoaded || nextState.storeStateChange !== this.state.storeStateChange;
        return propsChanged || stateChanged;
      }
    }, {
      key: "init",
      value: function init() {
        var storeContext = (0, _createStore.getStoreInstance)();
        var store = storeContext;

        if (store === undefined) {
          var errMsg = '\n 请先创建store实例！\n Please create a store instance first.';
          console.error(errMsg);
          throw new Error(errMsg);
        }

        var allModuleNames = store.getAllModuleName(); // 获取store中存在的模块

        var integralModulesName = moduleNames.filter(function (mn) {
          var isInclude = allModuleNames.includes(mn);

          if (!isInclude) {
            console.warn("inject: ".concat(mn, " module is not exits!"));
          }

          return isInclude;
        });
        return {
          store: store,
          integralModulesName: integralModulesName
        };
      }
    }, {
      key: "render",
      value: function render() {
        var _this$props = this.props,
            forwardedRef = _this$props.forwardedRef,
            props = _objectWithoutProperties(_this$props, ["forwardedRef"]);

        var newProps = Object.assign({}, props, {
          ref: forwardedRef
        });

        if (!this.integralModulesName.length) {
          console.warn("modules: ".concat(moduleNames.join(), " is not exits!"));
          console.warn("".concat(moduleNames.join(), " \u6A21\u5757\u4E0D\u5B58\u5728!"));
          return _react["default"].createElement(WrappedComponent, newProps);
        }

        if (this.state.modulesHasLoaded) {
          var store = this.store,
              integralModulesName = this.integralModulesName;
          this.injectModules = integralModulesName.reduce(function (res, mn) {
            res[mn] = store.getModule(mn);
            return res;
          }, {});
        }

        Object.assign(newProps, this.injectModules);

        var render = _react["default"].createElement(WrappedComponent, newProps);

        return this.state.modulesHasLoaded ? render : _react["default"].createElement(this.LoadingComponent, null);
      }
    }]);

    return Connect;
  }(_react["default"].Component);

  var FinalConnect = Connect;

  if (!!_react["default"].forwardRef) {
    FinalConnect = _react["default"].forwardRef(function ForwardConnect(props, ref) {
      return _react["default"].createElement(Connect, _extends({}, props, {
        forwardedRef: ref
      }));
    });
  }

  return (0, _hoistNonReactStatics["default"])(FinalConnect, WrappedComponent);
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