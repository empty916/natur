"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compose = compose;
exports.isEqualWithDepthLimit = isEqualWithDepthLimit;
exports.MapCache = exports.getValueFromObjByKeyPath = exports.isStoreModule = exports.isPromise = exports.isFnObj = exports.isFn = exports.isObj = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:13:15
 * @modify date 2019-08-09 17:13:15
 * @desc [description]
 */
var hasOwn = Object.prototype.hasOwnProperty;

var isObj = function isObj(obj) {
  return _typeof(obj) === 'object' && obj !== null && obj.constructor === Object;
};

exports.isObj = isObj;

var isFn = function isFn(arg) {
  return typeof arg === 'function';
};

exports.isFn = isFn;

var isFnObj = function isFnObj(obj) {
  if (isObj(obj)) {
    return Object.keys(obj).every(function (key) {
      return isFn(obj[key]);
    });
  }

  return false;
};

exports.isFnObj = isFnObj;

var isMapsObj = function isMapsObj(obj) {
  if (isObj(obj)) {
    return Object.keys(obj).every(function (key) {
      return obj[key].constructor === Array;
    });
  }

  return false;
};

var isPromise = function isPromise(obj) {
  return obj && typeof obj.then === 'function';
}; // export const isVoid = <T>(ar: T | void): ar is void => !ar;


exports.isPromise = isPromise;

var isStoreModule = function isStoreModule(obj) {
  if (!isObj(obj) || !isFnObj(obj.actions)) {
    return false;
  }

  if (!!obj.maps && !isMapsObj(obj.maps)) {
    return false;
  }

  return true;
};
/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */


exports.isStoreModule = isStoreModule;

function compose() {
  for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(function (a, b) {
    return function () {
      return a(b.apply(void 0, arguments));
    };
  });
}

function is(x, y) {
  if (x === y) {
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
}

function isEqualWithDepthLimit(objA, objB) {
  var depthLimit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3;
  var depth = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
  if (is(objA, objB)) return true;

  if (_typeof(objA) !== 'object' || objA === null || _typeof(objB) !== 'object' || objB === null) {
    return false;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;

  for (var i = 0; i < keysA.length; i++) {
    if (!hasOwn.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      if (_typeof(objA[keysA[i]]) === 'object' && _typeof(objB[keysB[i]]) === 'object' && depth < depthLimit) {
        return isEqualWithDepthLimit(objA[keysA[i]], objB[keysB[i]], depthLimit, depth + 1);
      }

      return false;
    }
  }

  return true;
}
/**
 * @param obj State
 * @param keyPath 'a.b[0].c'
 */


var getValueFromObjByKeyPath = function getValueFromObjByKeyPath(obj, keyPath) {
  var formatKeyArr = keyPath.replace(/\[/g, '.').replace(/\]/g, '').split('.');
  var value = obj;

  for (var i = 0; i < formatKeyArr.length; i++) {
    try {
      value = value[formatKeyArr[i]];
    } catch (error) {
      return undefined;
    }
  }

  return value;
};

exports.getValueFromObjByKeyPath = getValueFromObjByKeyPath;

var arrayIsEqual = function arrayIsEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (var i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
};

var MapCache =
/*#__PURE__*/
function () {
  function MapCache(getState, map) {
    var _this = this;

    _classCallCheck(this, MapCache);

    this.type = 'function';
    this.mapDepends = [];
    this.depCache = [];
    this.dependKeys = {};
    this.shouldCheckDependsCache = true;
    this.hasComparedDep = false;
    this.getState = getState;
    var copyMap = map.slice();
    this.map = copyMap.pop();
    copyMap.forEach(function (item) {
      return _this.mapDepends.push(_this.createGetDepByKeyPath(item));
    });
  }

  _createClass(MapCache, [{
    key: "createGetDepByKeyPath",
    value: function createGetDepByKeyPath(keyPath) {
      if (typeof keyPath === 'string') {
        return function (s) {
          return getValueFromObjByKeyPath(s, keyPath);
        };
      }

      return keyPath;
    }
  }, {
    key: "shouldCheckCache",
    value: function shouldCheckCache() {
      this.shouldCheckDependsCache = true;
      this.hasComparedDep = false;
    }
  }, {
    key: "getDepsValue",
    value: function getDepsValue() {
      var _this2 = this;

      return this.mapDepends.map(function (dep) {
        return dep(_this2.getState());
      });
    }
  }, {
    key: "hasDepChanged",
    value: function hasDepChanged() {
      if (this.shouldCheckDependsCache && !this.hasComparedDep) {
        var newDepCache = this.getDepsValue();
        var depHasChanged = !arrayIsEqual(this.depCache, newDepCache);

        if (depHasChanged) {
          this.depCache = newDepCache;
        }

        this.shouldCheckDependsCache = false;
        this.hasComparedDep = true;
        return depHasChanged;
      }

      return false;
    }
  }, {
    key: "getValue",
    value: function getValue() {
      if (this.hasDepChanged()) {
        this.value = this.map.apply(this, _toConsumableArray(this.depCache));
      }

      return this.value;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.map = function () {};

      this.mapDepends = [];
      this.depCache = [];

      this.getState = function () {
        return {};
      };

      this.dependKeys = {};
    }
  }]);

  return MapCache;
}();

exports.MapCache = MapCache;