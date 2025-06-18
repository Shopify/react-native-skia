"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mixColors = exports.interpolateColors = void 0;
var _math = require("../../renderer/processors/math");
var _skia = require("../../skia");
var _interpolate = require("./interpolate");
const interpolateColorsRGB = (value, inputRange, outputRange) => {
  "worklet";

  const r = (0, _interpolate.interpolate)(value, inputRange, outputRange.map(c => c[0]), "clamp");
  const g = (0, _interpolate.interpolate)(value, inputRange, outputRange.map(c => c[1]), "clamp");
  const b = (0, _interpolate.interpolate)(value, inputRange, outputRange.map(c => c[2]), "clamp");
  const a = (0, _interpolate.interpolate)(value, inputRange, outputRange.map(c => c[3]), "clamp");
  // TODO: once Float32Array are supported in the reanimated integration we can switch there
  return [r, g, b, a];
};
const interpolateColors = (value, inputRange, _outputRange) => {
  "worklet";

  const outputRange = _outputRange.map(cl => _skia.Skia.Color(cl));
  return interpolateColorsRGB(value, inputRange, outputRange);
};
exports.interpolateColors = interpolateColors;
const mixColors = (value, x, y) => {
  "worklet";

  const c1 = _skia.Skia.Color(x);
  const c2 = _skia.Skia.Color(y);
  return new Float32Array([(0, _math.mix)(value, c1[0], c2[0]), (0, _math.mix)(value, c1[1], c2[1]), (0, _math.mix)(value, c1[2], c2[2]), (0, _math.mix)(value, c1[3], c2[3])]);
};
exports.mixColors = mixColors;
//# sourceMappingURL=interpolateColors.js.map