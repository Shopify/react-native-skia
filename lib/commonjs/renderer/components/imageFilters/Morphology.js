"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Morphology = void 0;
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const Morphology = ({
  operator = "dilate",
  ...props
}) => {
  return /*#__PURE__*/_react.default.createElement("skMorphologyImageFilter", _extends({
    operator: operator
  }, props));
};
exports.Morphology = Morphology;
//# sourceMappingURL=Morphology.js.map