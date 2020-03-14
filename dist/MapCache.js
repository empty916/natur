import { getValueFromObjByKeyPath, arrayIsEqual } from './utils';

var MapCache = /*#__PURE__*/function () {
  function MapCache(getState, map) {
    var _this = this;

    this.type = 'function';
    this.mapDepends = [];
    this.depCache = [];
    this.dependKeys = {};
    this.shouldCheckDependsCache = true;
    this.getState = getState;
    var copyMap = map.slice();
    this.map = copyMap.pop();
    copyMap.forEach(function (item) {
      return _this.mapDepends.push(_this.createGetDepByKeyPath(item));
    });
  }

  MapCache.resetMapDepParser = function resetMapDepParser() {
    MapCache.getValueFromState = getValueFromObjByKeyPath;
  };

  MapCache.setMapDepParser = function setMapDepParser(parser) {
    MapCache.getValueFromState = parser;
  };

  var _proto = MapCache.prototype;

  _proto.createGetDepByKeyPath = function createGetDepByKeyPath(keyPath) {
    if (typeof keyPath !== 'function') {
      return function (s) {
        return MapCache.getValueFromState(s, keyPath);
      };
    }

    return keyPath;
  };

  _proto.shouldCheckCache = function shouldCheckCache() {
    this.shouldCheckDependsCache = true;
  };

  _proto.getDepsValue = function getDepsValue() {
    var _this2 = this;

    return this.mapDepends.map(function (dep) {
      return dep(_this2.getState());
    });
  };

  _proto.hasDepChanged = function hasDepChanged() {
    if (this.shouldCheckDependsCache) {
      var newDepCache = this.getDepsValue();
      var depHasChanged = !arrayIsEqual(this.depCache, newDepCache);

      if (depHasChanged) {
        this.depCache = newDepCache;
      }

      this.shouldCheckDependsCache = false;
      return depHasChanged;
    }

    return false;
  };

  _proto.getValue = function getValue() {
    if (this.hasDepChanged()) {
      this.value = this.map.apply(this, this.depCache);
    }

    return this.value;
  };

  _proto.destroy = function destroy() {
    this.map = function () {};

    this.mapDepends = [];
    this.depCache = [];

    this.getState = function () {
      return {};
    };

    this.dependKeys = {};
  };

  return MapCache;
}();

export { MapCache as default };
MapCache.getValueFromState = getValueFromObjByKeyPath;