"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "createStore", {
  enumerable: true,
  get: function get() {
    return _createStore["default"];
  }
});
Object.defineProperty(exports, "inject", {
  enumerable: true,
  get: function get() {
    return _inject["default"];
  }
});
Object.defineProperty(exports, "useInject", {
  enumerable: true,
  get: function get() {
    return _hooks.useInject;
  }
});
exports.resetMapDepParser = exports.setMapDepParser = void 0;

var _MapCache = _interopRequireDefault(require("./MapCache"));

var _createStore = _interopRequireDefault(require("./createStore"));

var _inject = _interopRequireDefault(require("./inject"));

var _hooks = require("./hooks");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:12:57
 * @modify date 2019-08-09 17:12:57
 * @desc [description]
 */
var setMapDepParser = _MapCache["default"].setMapDepParser;
exports.setMapDepParser = setMapDepParser;
var resetMapDepParser = _MapCache["default"].resetMapDepParser;
exports.resetMapDepParser = resetMapDepParser;