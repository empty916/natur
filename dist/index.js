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

var _createStore = _interopRequireDefault(require("./createStore"));

var _inject = _interopRequireDefault(require("./inject"));

var _hooks = require("./hooks");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }