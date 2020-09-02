import MapCache from "./MapCache";
export var isModuleDepDec = function isModuleDepDec(obj) {
  if (Array.isArray(obj) && obj.length === 2) {
    if (typeof obj[0] !== 'string') {
      return false;
    }

    if (obj[1].state && !Array.isArray(obj[1].state)) {
      return false;
    }

    if (obj[1].maps && !Array.isArray(obj[1].maps)) {
      return false;
    }

    return true;
  }

  return false;
};
export var initDiff = function initDiff(moduleDepDec, store) {
  var diff = {};

  var _loop = function _loop(moduleName) {
    if (moduleDepDec.hasOwnProperty(moduleName)) {
      diff[moduleName] = [];

      if (moduleDepDec[moduleName].state) {
        var stateCache = new MapCache(function () {
          return store.getModule(moduleName).state;
        }, [].concat(moduleDepDec[moduleName].state, [function () {}]));
        stateCache.hasDepChanged();
        diff[moduleName].push(stateCache);
      }

      if (moduleDepDec[moduleName].maps) {
        var mapsCache = new MapCache(function () {
          return store.getModule(moduleName).maps;
        }, [].concat(moduleDepDec[moduleName].maps, [function () {}]));
        mapsCache.hasDepChanged();
        diff[moduleName].push(mapsCache);
      }
    }
  };

  for (var moduleName in moduleDepDec) {
    _loop(moduleName);
  }

  var destroy = function destroy() {
    for (var _moduleName in diff) {
      diff[_moduleName].forEach(function (cache) {
        return cache.destroy();
      });

      diff[_moduleName] = [];
    }

    diff = {};
  };

  return {
    diff: diff,
    destroy: destroy
  };
};