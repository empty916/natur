"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:13:03
 * @modify date 2019-08-09 17:13:03
 * @desc [description]
 */
var react_1 = __importDefault(require("react"));
var hoist_non_react_statics_1 = __importDefault(require("hoist-non-react-statics"));
var utils_1 = require("./utils");
var injectCache_1 = require("./injectCache");
var Loading = function () { return null; };
var connect = function (moduleNames, depDecs, storeGetter, WrappedComponent, LoadingComponent) {
    var Connect = /** @class */ (function (_super) {
        __extends(Connect, _super);
        function Connect(props) {
            var _this = _super.call(this, props) || this;
            _this.injectModules = {};
            _this.unsubStore = function () { };
            _this.destroyCache = function () { };
            _this.state = {
                storeStateChange: {},
                modulesHasLoaded: false,
            };
            // 初始化store, integralModulesName(合法模块名)
            var _a = _this.init(), store = _a.store, integralModulesName = _a.integralModulesName;
            _this.store = store;
            _this.integralModulesName = integralModulesName;
            var unLoadedModules = integralModulesName.filter(function (mn) { return !store.hasModule(mn); });
            _this.unLoadedModules = unLoadedModules;
            // 初始化模块是否全部加载完成标记
            _this.state.modulesHasLoaded = !unLoadedModules.length;
            _this.setStoreStateChanged = _this.setStoreStateChanged.bind(_this);
            _this.LoadingComponent = LoadingComponent || Loading;
            _this.loadLazyModule();
            return _this;
        }
        Connect.prototype.setStoreStateChanged = function (moduleName) {
            if (!depDecs[moduleName]) {
                this.setState({
                    storeStateChange: {},
                });
            }
            else if (this.storeModuleDiff) {
                var hasDepChanged_1 = false;
                this.storeModuleDiff[moduleName].forEach(function (diff) {
                    diff.shouldCheckCache();
                    if (diff.hasDepChanged()) {
                        hasDepChanged_1 = true;
                    }
                });
                if (hasDepChanged_1) {
                    this.setState({
                        storeStateChange: {},
                    });
                }
            }
            else {
                this.setState({
                    storeStateChange: {},
                });
            }
        };
        Connect.prototype.initDiff = function (moduleDepDec, store) {
            if (moduleDepDec === void 0) { moduleDepDec = depDecs; }
            if (store === void 0) { store = this.store; }
            var _a = injectCache_1.initDiff(moduleDepDec, store), diff = _a.diff, destroy = _a.destroy;
            this.storeModuleDiff = diff;
            this.destroyCache = destroy;
        };
        Connect.prototype.initStoreListner = function () {
            var _a = this, store = _a.store, integralModulesName = _a.integralModulesName, setStoreStateChanged = _a.setStoreStateChanged;
            var unsubscribes = integralModulesName.map(function (mn) { return store.subscribe(mn, function () { return setStoreStateChanged(mn); }); });
            this.unsubStore = function () { return unsubscribes.forEach(function (fn) { return fn(); }); };
        };
        Connect.prototype.loadLazyModule = function () {
            var _this = this;
            var _a = this, store = _a.store, unLoadedModules = _a.unLoadedModules;
            var modulesHasLoaded = this.state.modulesHasLoaded;
            if (!modulesHasLoaded) {
                Promise.all(unLoadedModules.map(function (mn) { return store.loadModule(mn); }))
                    .then(function () {
                    _this.initStoreListner();
                    _this.initDiff();
                    _this.setState({
                        modulesHasLoaded: true,
                    });
                })
                    .catch(function () {
                    _this.setState({
                        modulesHasLoaded: false,
                    });
                });
            }
            else {
                // 初始化store监听
                this.initStoreListner();
                this.initDiff();
            }
        };
        Connect.prototype.componentWillUnmount = function () {
            this.unsubStore();
            this.destroyCache();
            this.unsubStore = function () { };
            this.destroyCache = function () { };
        };
        Connect.prototype.shouldComponentUpdate = function (nextProps, nextState) {
            var propsChanged = !utils_1.isEqualWithDepthLimit(this.props, nextProps, 1);
            var stateChanged = nextState.modulesHasLoaded !== this.state.modulesHasLoaded || nextState.storeStateChange !== this.state.storeStateChange;
            return propsChanged || stateChanged;
        };
        Connect.prototype.init = function () {
            var store = storeGetter();
            // if (store === undefined) {
            // 	const errMsg = '\n 请先创建store实例！\n Please create a store instance first.';
            // 	console.error(errMsg);
            // 	throw new Error(errMsg);
            // }
            var allModuleNames = store.getAllModuleName();
            // 获取store中存在的模块
            var integralModulesName = moduleNames.filter(function (mn) {
                var isInclude = allModuleNames.includes(mn);
                if (!isInclude) {
                    console.warn("inject: " + mn + " module is not exits!");
                }
                return isInclude;
            });
            return { store: store, integralModulesName: integralModulesName };
        };
        Connect.prototype.render = function () {
            var _a = this.props, forwardedRef = _a.forwardedRef, props = __rest(_a, ["forwardedRef"]);
            var newProps = Object.assign({}, props, {
                ref: forwardedRef,
            });
            if (!this.integralModulesName.length) {
                console.warn("modules: " + moduleNames.join() + " is not exits!");
                console.warn(moduleNames.join() + " \u6A21\u5757\u4E0D\u5B58\u5728!");
                return react_1.default.createElement(WrappedComponent, __assign({}, newProps));
            }
            if (this.state.modulesHasLoaded) {
                var _b = this, store_1 = _b.store, integralModulesName = _b.integralModulesName;
                this.injectModules = integralModulesName.reduce(function (res, mn) {
                    res[mn] = store_1.getModule(mn);
                    return res;
                }, {});
            }
            Object.assign(newProps, this.injectModules);
            var render = react_1.default.createElement(WrappedComponent, __assign({}, newProps));
            return this.state.modulesHasLoaded ? render : react_1.default.createElement(this.LoadingComponent, null);
        };
        return Connect;
    }(react_1.default.Component));
    var FinalConnect = Connect;
    if (!!react_1.default.forwardRef) {
        FinalConnect = react_1.default.forwardRef(function ForwardConnect(props, ref) { return react_1.default.createElement(Connect, __assign({}, props, { forwardedRef: ref })); });
    }
    return hoist_non_react_statics_1.default(FinalConnect, WrappedComponent);
};
var createInject = function (_a) {
    var storeGetter = _a.storeGetter, _b = _a.loadingComponent, loadingComponent = _b === void 0 ? Loading : _b;
    function Inject() {
        var moduleDec = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            moduleDec[_i] = arguments[_i];
        }
        var depDecs = {};
        var moduleNames = moduleDec.map(function (m) {
            if (injectCache_1.isModuleDepDec(m)) {
                depDecs[m[0]] = m[1];
                return m[0];
            }
            return m;
        });
        var connectHOC = function (WrappedComponent, LoadingComponent) {
            if (LoadingComponent === void 0) { LoadingComponent = loadingComponent; }
            return connect(moduleNames, depDecs, storeGetter, WrappedComponent, LoadingComponent);
        };
        var type = null;
        connectHOC.type = type;
        return connectHOC;
    }
    Inject.setLoadingComponent = function (LoadingComponent) { return Loading = LoadingComponent; };
    return Inject;
};
exports.default = createInject;
