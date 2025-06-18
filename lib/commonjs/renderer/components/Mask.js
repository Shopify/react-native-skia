"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Mask = void 0;
var _react = _interopRequireDefault(require("react"));
var _Group = require("./Group");
var _LumaColorFilter = require("./colorFilters/LumaColorFilter");
var _Paint = require("./Paint");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const Mask = ({
  children,
  mask,
  mode = "alpha",
  clip = true
}) => {
  return /*#__PURE__*/_react.default.createElement(_Group.Group, {
    layer: true
  }, /*#__PURE__*/_react.default.createElement(_Group.Group, {
    layer: /*#__PURE__*/_react.default.createElement(_Paint.Paint, {
      blendMode: "src"
    }, mode === "luminance" && /*#__PURE__*/_react.default.createElement(_LumaColorFilter.LumaColorFilter, null))
  }, mask, clip && /*#__PURE__*/_react.default.createElement(_Group.Group, {
    layer: /*#__PURE__*/_react.default.createElement(_Paint.Paint, {
      blendMode: "dstIn"
    })
  }, children)), /*#__PURE__*/_react.default.createElement(_Group.Group, {
    blendMode: "srcIn"
  }, children));
};
exports.Mask = Mask;
//# sourceMappingURL=Mask.js.map