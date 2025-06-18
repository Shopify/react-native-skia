"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Group = void 0;
var _react = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const Group = ({
  layer,
  ...props
}) => {
  if (/*#__PURE__*/(0, _react.isValidElement)(layer) && typeof layer === "object") {
    return /*#__PURE__*/_react.default.createElement("skLayer", null, layer, /*#__PURE__*/_react.default.createElement("skGroup", props));
  }
  return /*#__PURE__*/_react.default.createElement("skGroup", _extends({
    layer: layer
  }, props));
};
exports.Group = Group;
//# sourceMappingURL=Group.js.map