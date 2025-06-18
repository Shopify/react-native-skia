"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BackdropBlur = void 0;
var _react = _interopRequireDefault(require("react"));
var _imageFilters = require("../imageFilters");
var _BackdropFilter = require("./BackdropFilter");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const BackdropBlur = ({
  blur,
  children,
  ...props
}) => {
  return /*#__PURE__*/_react.default.createElement(_BackdropFilter.BackdropFilter, _extends({
    filter: /*#__PURE__*/_react.default.createElement(_imageFilters.Blur, {
      blur: blur,
      mode: "clamp"
    })
  }, props), children);
};
exports.BackdropBlur = BackdropBlur;
//# sourceMappingURL=BackdropBlur.js.map