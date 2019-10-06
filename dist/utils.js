"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compose = compose;
exports.isEqualWithDepthLimit = isEqualWithDepthLimit;
exports.Watcher = exports.Depend = exports.ObjChangedKeys = exports.ObjHasSameKeys = void 0;

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
var ObjHasSameKeys = function ObjHasSameKeys(obj1, obj2) {
  if (!obj1 || !obj2) {
    return false;
  }

  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
  }

  for (var key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      if (!obj2.hasOwnProperty(key)) {
        return false;
      }
    }
  }

  return true;
};

exports.ObjHasSameKeys = ObjHasSameKeys;

var ObjChangedKeys = function ObjChangedKeys(source, afterChange) {
  // console.log(source, afterChange);
  if (!source || !afterChange) {
    return {
      updatedKeys: [],
      keyHasChanged: false
    };
  } // KEY还在，但是值变化了的


  var updatedKeys = []; // KEY是否变动

  var keyHasChanged = false;

  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      if (!afterChange.hasOwnProperty(key)) {
        keyHasChanged = true;
        updatedKeys.push(key);
      }

      if (afterChange.hasOwnProperty(key) && source[key] !== afterChange[key]) {
        updatedKeys.push(key);
      }
    }
  }

  for (var _key in afterChange) {
    if (afterChange.hasOwnProperty(_key)) {
      if (!source.hasOwnProperty(_key)) {
        updatedKeys.push(_key);
        keyHasChanged = true;
      }
    }
  }

  return {
    updatedKeys: updatedKeys,
    keyHasChanged: keyHasChanged
  };
};

exports.ObjChangedKeys = ObjChangedKeys;

function compose() {
  for (var _len = arguments.length, funcs = new Array(_len), _key2 = 0; _key2 < _len; _key2++) {
    funcs[_key2] = arguments[_key2];
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

var hasOwn = Object.prototype.hasOwnProperty;

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

var Depend =
/*#__PURE__*/
function () {
  function Depend(moduleName, stateName) {
    _classCallCheck(this, Depend);

    this.watchers = [];
    this.watchersMap = {};
    this.moduleName = moduleName;
    this.stateName = stateName;
  }

  _createClass(Depend, [{
    key: "addWatcher",
    value: function addWatcher(watcher) {
      if (!this.watchersMap[watcher.moduleName + watcher.mapName]) {
        this.watchers.push(watcher);
        this.watchersMap[watcher.moduleName + watcher.mapName] = true;
        watcher.addDepend(this);
      }
    }
  }, {
    key: "removeWatcher",
    value: function removeWatcher(watcher) {
      this.watchers = this.watchers.filter(function (w) {
        return w !== watcher;
      });
      delete this.watchersMap[watcher.moduleName + watcher.mapName];
    }
  }, {
    key: "clearWatcher",
    value: function clearWatcher() {
      var _this = this;

      this.watchers.forEach(function (w) {
        return w.removeDepend(_this);
      });
      this.watchersMap = {};
      this.watchers = [];
    }
  }, {
    key: "notify",
    value: function notify() {
      this.watchers.forEach(function (w) {
        return w.update();
      });
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.clearWatcher();
    }
  }]);

  return Depend;
}();

exports.Depend = Depend;
Depend.targetWatcher = undefined;

var Watcher =
/*#__PURE__*/
function () {
  function Watcher(moduleName, mapName, runner) {
    _classCallCheck(this, Watcher);

    this.depends = [];
    this.useCache = false;
    this.dependsMap = {};
    this.moduleName = moduleName;
    this.mapName = mapName;
    this.mapRunner = runner;
  }

  _createClass(Watcher, [{
    key: "update",
    value: function update() {
      this.useCache = false;
    }
  }, {
    key: "run",
    value: function run() {
      Depend.targetWatcher = this;
      this.cache = this.mapRunner();
      Depend.targetWatcher = undefined;
      this.useCache = true;
    }
  }, {
    key: "addDepend",
    value: function addDepend(depend) {
      if (!this.dependsMap[depend.moduleName + depend.stateName]) {
        this.depends.push(depend);
        this.dependsMap[depend.moduleName + depend.stateName] = true;
      }
    }
  }, {
    key: "removeDepend",
    value: function removeDepend(depend) {
      this.depends.filter(function (dep) {
        return dep !== depend;
      });
      delete this.dependsMap[depend.moduleName + depend.stateName];
    }
  }, {
    key: "clearDepends",
    value: function clearDepends() {
      var _this2 = this;

      this.depends.forEach(function (dep) {
        return dep.removeWatcher(_this2);
      });
      this.depends = [];
      this.dependsMap = {};
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.clearDepends();
      this.cache = null;

      this.mapRunner = function () {};
    }
  }]);

  return Watcher;
}();

exports.Watcher = Watcher;