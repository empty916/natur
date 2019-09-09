"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.StoreContext = void 0;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var StoreContext = _react["default"].createContext(undefined);

exports.StoreContext = StoreContext;

var Provider = function Provider(_ref) {
  var store = _ref.store,
      children = _ref.children;
  return _react["default"].createElement(StoreContext.Provider, {
    value: store
  }, children);
};

var _default = Provider;
exports["default"] = _default;