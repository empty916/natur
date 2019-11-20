"use strict";function _interopDefault(e){return e&&"object"==typeof e&&"default"in e?e.default:e}var React=require("react"),React__default=_interopDefault(React),hoistStatics=_interopDefault(require("hoist-non-react-statics"));function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function _createClass(e,t,r){return t&&_defineProperties(e.prototype,t),r&&_defineProperties(e,r),e}function _defineProperty(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function _extends(){return(_extends=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e}).apply(this,arguments)}function ownKeys(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function _objectSpread2(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?ownKeys(r,!0).forEach((function(t){_defineProperty(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):ownKeys(r).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&_setPrototypeOf(e,t)}function _getPrototypeOf(e){return(_getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function _setPrototypeOf(e,t){return(_setPrototypeOf=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function _objectWithoutPropertiesLoose(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}function _objectWithoutProperties(e,t){if(null==e)return{};var r,n,o=_objectWithoutPropertiesLoose(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}function _assertThisInitialized(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function _possibleConstructorReturn(e,t){return!t||"object"!=typeof t&&"function"!=typeof t?_assertThisInitialized(e):t}function _slicedToArray(e,t){return _arrayWithHoles(e)||_iterableToArrayLimit(e,t)||_nonIterableRest()}function _toConsumableArray(e){return _arrayWithoutHoles(e)||_iterableToArray(e)||_nonIterableSpread()}function _arrayWithoutHoles(e){if(Array.isArray(e)){for(var t=0,r=new Array(e.length);t<e.length;t++)r[t]=e[t];return r}}function _arrayWithHoles(e){if(Array.isArray(e))return e}function _iterableToArray(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}function _iterableToArrayLimit(e,t){var r=[],n=!0,o=!1,a=void 0;try{for(var u,i=e[Symbol.iterator]();!(n=(u=i.next()).done)&&(r.push(u.value),!t||r.length!==t);n=!0);}catch(e){o=!0,a=e}finally{try{n||null==i.return||i.return()}finally{if(o)throw a}}return r}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance")}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}var hasOwn=Object.prototype.hasOwnProperty,isObj=function(e){return"object"===_typeof(e)&&null!==e&&e.constructor===Object},isFn=function(e){return"function"==typeof e},isFnObj=function(e){return!!isObj(e)&&Object.keys(e).every((function(t){return isFn(e[t])}))},isMapsObj=function(e){return!!isObj(e)&&Object.keys(e).every((function(t){return e[t].constructor===Array}))},isStoreModule=function(e){return!(!isObj(e)||!isFnObj(e.actions))&&!(e.maps&&!isMapsObj(e.maps))};function compose(){for(var e=arguments.length,t=new Array(e),r=0;r<e;r++)t[r]=arguments[r];return 0===t.length?function(e){return e}:1===t.length?t[0]:t.reduce((function(e,t){return function(){return e(t.apply(void 0,arguments))}}))}function is(e,t){return e===t?0!==e||0!==t||1/e==1/t:e!=e&&t!=t}function isEqualWithDepthLimit(e,t){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:3,n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:1;if(is(e,t))return!0;if("object"!==_typeof(e)||null===e||"object"!==_typeof(t)||null===t)return!1;var o=Object.keys(e),a=Object.keys(t);if(o.length!==a.length)return!1;for(var u=0;u<o.length;u++)if(!hasOwn.call(t,o[u])||!is(e[o[u]],t[o[u]]))return"object"===_typeof(e[o[u]])&&"object"===_typeof(t[a[u]])&&n<r&&isEqualWithDepthLimit(e[o[u]],t[a[u]],r,n+1);return!0}var currentStoreInstance,getValueFromObjByKeyPath=function(e,t){for(var r=t.replace(/\[/g,".").replace(/\]/g,"").split("."),n=e,o=0;o<r.length;o++)try{n=n[r[o]]}catch(e){return}return n},arrayIsEqual=function(e,t){if(e.length!==t.length)return!1;for(var r=0;r<e.length;r++)if(e[r]!==t[r])return!1;return!0},MapCache=function(){function e(t,r){var n=this;_classCallCheck(this,e),this.type="function",this.mapDepends=[],this.depCache=[],this.dependKeys={},this.shouldCheckDependsCache=!0,this.getState=t;var o=r.slice();this.map=o.pop(),o.forEach((function(e){return n.mapDepends.push(n.createGetDepByKeyPath(e))}))}return _createClass(e,[{key:"createGetDepByKeyPath",value:function(t){return"function"!=typeof t?function(r){return e.getValueFromState(r,t)}:t}},{key:"shouldCheckCache",value:function(){this.shouldCheckDependsCache=!0}},{key:"getDepsValue",value:function(){var e=this;return this.mapDepends.map((function(t){return t(e.getState())}))}},{key:"hasDepChanged",value:function(){if(this.shouldCheckDependsCache){var e=this.getDepsValue(),t=!arrayIsEqual(this.depCache,e);return t&&(this.depCache=e),this.shouldCheckDependsCache=!1,t}return!1}},{key:"getValue",value:function(){return this.hasDepChanged()&&(this.value=this.map.apply(this,_toConsumableArray(this.depCache))),this.value}},{key:"destroy",value:function(){this.map=function(){},this.mapDepends=[],this.depCache=[],this.getState=function(){return{}},this.dependKeys={}}}],[{key:"resetMapDepParser",value:function(){e.getValueFromState=getValueFromObjByKeyPath}},{key:"setMapDepParser",value:function(t){e.getValueFromState=t}}]),e}();MapCache.getValueFromState=getValueFromObjByKeyPath;var createStore=function(){var e,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:[],a=_objectSpread2({},n),u={},i=r,s={},c=_toConsumableArray(o),l={},f={},p={},d=function(e,t){var r;return a[e]?(r=_objectSpread2({},t,{state:a[e]}),delete a[e]):r=_objectSpread2({},t),r},h=function(e){return!!u[e]},y=function(e){if(!h(e)){var t="module: ".concat(e," is not valid!");throw console.error(t),new Error(t)}},b=function(e){return delete l[e]},g=function(e){delete f[e],p[e].forEach((function(e){return e.destroy()})),delete p[e]},v=function(e){p[e].forEach((function(e){return e.shouldCheckCache()}))},m=function(e){g(e),b(e)},_=function(){return e||(e=_toConsumableArray(new Set([].concat(_toConsumableArray(Object.keys(u)),_toConsumableArray(Object.keys(i)))))),e},j=function(e){return Array.isArray(s[e])&&s[e].forEach((function(e){return e()}))},S=function(e,t){return u[e].state===t?t:(u[e].state=t,v(e),j(e),u[e].state)},O=function(t,r){if(!isStoreModule(r)){var n="setModule: storeModule ".concat(t," is illegal!");throw console.error(n),new Error(n)}var o=h(t);return u=_objectSpread2({},u,_defineProperty({},t,d(t,r))),o?m(t):e=void 0,f[t]||(f[t]={},p[t]=[]),j(t),currentStoreInstance},w=function(t){delete u[t],delete i[t],e=void 0,m(t)},C=function(e){return w(e),j(e),currentStoreInstance},P=function(e){var t=u[e].maps;if(void 0!==t){var r={};for(var n in t)if(t.hasOwnProperty(n)){void 0===f[e][n]&&(f[e][n]=new MapCache((function(){return u[e].state}),t[n]),p[e].push(f[e][n]));var o=f[e][n];r[n]=o.getValue()}return r}},M=function(e){if(l[e])return l[e];var t=_objectSpread2({},u[e].actions),r=D(e);return Object.keys(t).forEach((function(e){return t[e]=function(){for(var t=arguments.length,n=new Array(t),o=0;o<t;o++)n[o]=arguments[o];return r.apply(void 0,[e].concat(n))}})),l[e]=t,t},I=function(e){return y(e),{state:u[e].state,actions:M(e),maps:P(e)}},E=function(e){return y(e),u[e]},k=function(e){if(i[e])return i[e];var t="getLazyModule: ".concat(e," is not exist");throw console.error(t),new Error(t)},D=function(e){y(e);var t=function(e){var t=e.state,r=e.moduleName;return S(r,t)},r={setState:t,getState:function(){return u[e].state}},n=c.map((function(e){return e(r)})),o=compose.apply(void 0,_toConsumableArray(n))(t);return function(t){var r,n;y(e);for(var a=u[e],i=arguments.length,s=new Array(i>1?i-1:0),c=1;c<i;c++)s[c-1]=arguments[c];return n=(r=a.actions)[t].apply(r,s),o({moduleName:e,actionName:t,state:n})}},A=function(e,t){return s[e]||(s[e]=[]),s[e].push(t),function(){return s[e]=s[e].filter((function(e){return t!==e}))}},L=function(){Object.keys(u).forEach(w),a={},i={},s={},e=void 0,c=[]},R=function(){currentStoreInstance&&currentStoreInstance.destory(),Object.keys(t).forEach((function(e){O(e,t[e])}))};return R(),currentStoreInstance={getAllModuleName:_,getModule:I,removeModule:C,getOriginModule:E,getLazyModule:k,setModule:O,hasModule:h,subscribe:A,destory:L}},getStoreInstance=function(){return currentStoreInstance},Loading=function(){return null},_getStoreInstance=getStoreInstance,createLoadModulesPromise=function(e,t){return e.map((function(e){return t.getLazyModule(e)()}))},connect=function(e,t,r){var n=function(n){function o(e,t){var n;_classCallCheck(this,o),(n=_possibleConstructorReturn(this,_getPrototypeOf(o).call(this,e,t))).injectModules={},n.unsubStore=function(){},n.state={storeStateChange:{},modulesHasLoaded:!1};var a=n.init(),u=a.store,i=a.integralModulesName;n.store=u,n.integralModulesName=i;var s=i.filter((function(e){return!u.hasModule(e)}));return n.unLoadedModules=s,n.state.modulesHasLoaded=!s.length,n.setStoreStateChanged=n.setStoreStateChanged.bind(_assertThisInitialized(n)),n.LoadingComponent=r||Loading,n}return _inherits(o,React__default.Component),_createClass(o,[{key:"setStoreStateChanged",value:function(){this.setState({storeStateChange:{}})}},{key:"componentDidMount",value:function(){var e=this,t=this.store,r=this.integralModulesName,n=this.unLoadedModules,o=this.setStoreStateChanged,a=this.state.modulesHasLoaded,u=r.map((function(e){return t.subscribe(e,o)}));if(this.unsubStore=function(){return u.forEach((function(e){return e()}))},!a){var i=createLoadModulesPromise(n,t);Promise.all(i).then((function(r){r.forEach((function(e,r){return t.setModule(n[r],e)})),e.setState({modulesHasLoaded:!0})})).catch((function(t){e.setState({modulesHasLoaded:!1})}))}}},{key:"componentWillUnmount",value:function(){this.unsubStore(),this.unsubStore=function(){}}},{key:"shouldComponentUpdate",value:function(e,t){var r=!isEqualWithDepthLimit(this.props,e,3),n=t.modulesHasLoaded!==this.state.modulesHasLoaded||t.storeStateChange!==this.state.storeStateChange;return r||n}},{key:"init",value:function(){var t=_getStoreInstance();if(void 0===t){var r="\n 请先创建store实例！\n Please create a store instance first.";throw console.error(r),new Error(r)}var n=t.getAllModuleName();return{store:t,integralModulesName:e.filter((function(e){var t=n.includes(e);return t||console.warn("inject: ".concat(e," module is not exits!")),t}))}}},{key:"render",value:function(){var r=this.props,n=r.forwardedRef,o=_objectWithoutProperties(r,["forwardedRef"]),a=Object.assign({},o,{ref:n});if(!this.integralModulesName.length)return console.warn("modules: ".concat(e.join()," is not exits!")),console.warn("".concat(e.join()," 模块不存在!")),React__default.createElement(t,a);if(this.state.modulesHasLoaded){var u=this.store,i=this.integralModulesName;this.injectModules=i.reduce((function(e,t){return e[t]=u.getModule(t),e}),{})}Object.assign(a,this.injectModules);var s=React__default.createElement(t,a);return this.state.modulesHasLoaded?s:React__default.createElement(this.LoadingComponent,null)}}]),o}(),o=n;return React__default.forwardRef&&(o=React__default.forwardRef((function(e,t){return React__default.createElement(n,_extends({},e,{forwardedRef:t}))}))),hoistStatics(o,t)},Inject=function(){for(var e=arguments.length,t=new Array(e),r=0;r<e;r++)t[r]=arguments[r];return function(e,r){return connect(t,e,r)}};Inject.setLoadingComponent=function(e){return Loading=e},Inject.setStoreGetter=function(e){_getStoreInstance=e};var createLoadModulesPromise$1=function(e,t){return e.map((function(e){return t.getLazyModule(e)()}))},_getStoreInstance$1=getStoreInstance;function useInject(){for(var e=arguments.length,t=new Array(e),r=0;r<e;r++)t[r]=arguments[r];if(0===t.length){var n="useInject: moduleNames param is required!";throw console.error(n),new Error(n)}var o=_slicedToArray(React.useState(t),2),a=o[0],u=o[1];arrayIsEqual(t,a)||u(t);var i=_getStoreInstance$1(),s=i.getAllModuleName(),c=a.filter((function(e){return!s.includes(e)}));if(c.length){var l="useInject: ".concat(c.join()," module is not exits!");throw console.error(l),new Error(l)}var f=_slicedToArray(React.useState({}),2),p=(f[0],f[1]),d=a.filter((function(e){return!i.hasModule(e)})),h=!!d.length,y=React.useCallback((function(){return p({})}),[p]);return React.useEffect((function(){var e=a.map((function(e){return i.subscribe(e,y)}));return function(){return e.forEach((function(e){return e()}))}}),[a]),React.useEffect((function(){if(h){var e=createLoadModulesPromise$1(d,i);Promise.all(e).then((function(e){e.forEach((function(e,t){return i.setModule(d[t],e)})),p({})})).catch((function(e){p({})}))}}),[h]),h?(console.log("store module is loading."),[]):a.reduce((function(e,t){return e.push(i.getModule(t)),e}),[])}useInject.setStoreGetter=function(e){_getStoreInstance$1=e};var setMapDepParser=MapCache.setMapDepParser,resetMapDepParser=MapCache.resetMapDepParser,setInjectStoreGetter=function(e){useInject.setStoreGetter(e),Inject.setStoreGetter(e)};exports.createStore=createStore,exports.inject=Inject,exports.resetMapDepParser=resetMapDepParser,exports.setInjectStoreGetter=setInjectStoreGetter,exports.setMapDepParser=setMapDepParser,exports.useInject=useInject;
