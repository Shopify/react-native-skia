"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Points = void 0;
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const Points = ({
  mode = "points",
  ...props
}) => {
  return /*#__PURE__*/_react.default.createElement("skPoints", _extends({
    mode: mode
  }, props));
};
exports.Points = Points;
//# sourceMappingURL=Points.js.map