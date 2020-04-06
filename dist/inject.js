function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:13:03
 * @modify date 2019-08-09 17:13:03
 * @desc [description]
 */
import React from 'react';
import hoistStatics from 'hoist-non-react-statics';
import { getStoreInstance } from './createStore';
import { isEqualWithDepthLimit, isModuleDepDec, initDiff as _initDiff } from './utils';

var Loading = function Loading() {
  return null;
};

var _getStoreInstance = getStoreInstance;

var connect = function connect(moduleNames, depDecs, WrappedComponent, LoadingComponent) {
  var Connect = /*#__PURE__*/function (_React$Component) {
    _inheritsLoose(Connect, _React$Component);

    function Connect(props) {
      var _this;

      _this = _React$Component.call(this, props) || this;
      _this.injectModules = {};

      _this.unsubStore = function () {};

      _this.destoryCache = function () {};

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

    var _proto = Connect.prototype;

    _proto.setStoreStateChanged = function setStoreStateChanged(moduleName) {
      if (!depDecs[moduleName]) {
        this.setState({
          storeStateChange: {}
        });
      } else if (this.storeModuleDiff) {
        var hasDepChanged = this.storeModuleDiff[moduleName].some(function (diff) {
          diff.shouldCheckCache();
          return diff.hasDepChanged();
        });

        if (hasDepChanged) {
          this.setState({
            storeStateChange: {}
          });
        }
      } else {
        this.setState({
          storeStateChange: {}
        });
      }
    };

    _proto.initDiff = function initDiff(moduleDepDec, store) {
      if (moduleDepDec === void 0) {
        moduleDepDec = depDecs;
      }

      if (store === void 0) {
        store = this.store;
      }

      var _initDiff2 = _initDiff(moduleDepDec, store),
          diff = _initDiff2.diff,
          destroy = _initDiff2.destroy;

      this.storeModuleDiff = diff;
      this.destoryCache = destroy;
    };

    _proto.initStoreListner = function initStoreListner() {
      var store = this.store,
          integralModulesName = this.integralModulesName,
          setStoreStateChanged = this.setStoreStateChanged;
      var unsubscribes = integralModulesName.map(function (mn) {
        return store.subscribe(mn, function () {
          return setStoreStateChanged(mn);
        });
      });

      this.unsubStore = function () {
        return unsubscribes.forEach(function (fn) {
          return fn();
        });
      };
    };

    _proto.componentDidMount = function componentDidMount() {
      var _this2 = this;

      var store = this.store,
          unLoadedModules = this.unLoadedModules;
      var modulesHasLoaded = this.state.modulesHasLoaded;

      if (!modulesHasLoaded) {
        Promise.all(unLoadedModules.map(function (mn) {
          return store.loadModule(mn);
        })).then(function () {
          _this2.initStoreListner();

          _this2.initDiff();

          _this2.setState({
            modulesHasLoaded: true
          });
        })["catch"](function () {
          _this2.setState({
            modulesHasLoaded: false
          });
        });
      } else {
        // 初始化store监听
        this.initStoreListner();
        this.initDiff();
      }
    };

    _proto.componentWillUnmount = function componentWillUnmount() {
      this.unsubStore();
      this.destoryCache();

      this.unsubStore = function () {};

      this.destoryCache = function () {};
    };

    _proto.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
      var propsChanged = !isEqualWithDepthLimit(this.props, nextProps, 1);
      var stateChanged = nextState.modulesHasLoaded !== this.state.modulesHasLoaded || nextState.storeStateChange !== this.state.storeStateChange;
      return propsChanged || stateChanged;
    };

    _proto.init = function init() {
      var storeContext = _getStoreInstance();

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
          console.warn("inject: " + mn + " module is not exits!");
        }

        return isInclude;
      });
      return {
        store: store,
        integralModulesName: integralModulesName
      };
    };

    _proto.render = function render() {
      var _this$props = this.props,
          forwardedRef = _this$props.forwardedRef,
          props = _objectWithoutPropertiesLoose(_this$props, ["forwardedRef"]);

      var newProps = Object.assign({}, props, {
        ref: forwardedRef
      });

      if (!this.integralModulesName.length) {
        console.warn("modules: " + moduleNames.join() + " is not exits!");
        console.warn(moduleNames.join() + " \u6A21\u5757\u4E0D\u5B58\u5728!");
        return React.createElement(WrappedComponent, newProps);
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
      var render = React.createElement(WrappedComponent, newProps);
      return this.state.modulesHasLoaded ? render : React.createElement(this.LoadingComponent, null);
    };

    return Connect;
  }(React.Component);

  var FinalConnect = Connect;

  if (!!React.forwardRef) {
    FinalConnect = React.forwardRef(function ForwardConnect(props, ref) {
      return React.createElement(Connect, _extends({}, props, {
        forwardedRef: ref
      }));
    });
  }

  return hoistStatics(FinalConnect, WrappedComponent);
}; // type InjectReturn<StoreProp> = <P extends StoreProp>(
// 	WrappedComponent: TReactComponent<P>, 
// 	LoadingComponent?: TReactComponent<{}>
// ) => connectReturn<P, StoreProp>;
// type InjectParams = Array<string|ModuleDepDec>;


function Inject() {
  var depDecs = {};

  for (var _len = arguments.length, moduleDec = new Array(_len), _key = 0; _key < _len; _key++) {
    moduleDec[_key] = arguments[_key];
  }

  var moduleNames = moduleDec.map(function (m) {
    if (isModuleDepDec(m)) {
      depDecs[m[0]] = m[1];
      return m[0];
    }

    return m;
  });
  return function (WrappedComponent, LoadingComponent) {
    return connect(moduleNames, depDecs, WrappedComponent, LoadingComponent);
  };
}

Inject.setLoadingComponent = function (LoadingComponent) {
  return Loading = LoadingComponent;
};

Inject.setStoreGetter = function (storeGetter) {
  _getStoreInstance = storeGetter;
};

export default Inject;