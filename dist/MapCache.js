"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _utils = require("./utils");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
    this.firstRun = true;
    this.getState = getState;

    if (typeof map === 'function') {
      this.type = 'function';
      this.map = map;
    } else {
      this.type = 'array';
      var copyMap = map.slice();
      this.map = copyMap.pop();
      copyMap.forEach(function (item) {
        return _this.mapDepends.push(_this.createGetDepByKeyPath(item));
      });
    }
  }

  _createClass(MapCache, [{
    key: "createGetDepByKeyPath",
    value: function createGetDepByKeyPath(keyPath) {
      if (typeof keyPath === 'string') {
        return function (s) {
          return MapCache.getValueFromState(s, keyPath);
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
    key: "addDependKey",
    value: function addDependKey(key) {
      if (!this.dependKeys[key] && this.type === 'function') {
        this.dependKeys[key] = true;
        this.mapDepends.push(this.createGetDepByKeyPath(key));
      }
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
        var depHasChanged = !(0, _utils.arrayIsEqual)(this.depCache, newDepCache); // 首次运行map，还没有缓存，只有在type是函数的情况下存在。

        if (this.firstRun) {
          depHasChanged = true;
        }

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
        if (this.type === 'function') {
          MapCache.runningMap = this;
          this.value = this.map(this.getState());
          MapCache.runningMap = undefined;

          if (this.firstRun) {
            this.depCache = this.getDepsValue();
          }
        } else {
          this.value = this.map.apply(this, _toConsumableArray(this.depCache));
        }
      }

      if (this.firstRun) {
        this.firstRun = false;
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
  }], [{
    key: "resetMapDepParser",
    value: function resetMapDepParser() {
      MapCache.getValueFromState = _utils.getValueFromObjByKeyPath;
    }
  }, {
    key: "setMapDepParser",
    value: function setMapDepParser(parser) {
      MapCache.getValueFromState = parser;
    }
  }]);

  return MapCache;
}();

exports["default"] = MapCache;
MapCache.getValueFromState = _utils.getValueFromObjByKeyPath;