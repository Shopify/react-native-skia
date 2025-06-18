"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mixVector = exports.interpolateVector = void 0;
var _interpolate = require("./interpolate");
const interpolateVector = (value, inputRange, outputRange, options) => {
  "worklet";

  return {
    x: (0, _interpolate.interpolate)(value, inputRange, outputRange.map(v => v.x), options),
    y: (0, _interpolate.interpolate)(value, inputRange, outputRange.map(v => v.y), options)
  };
};
exports.interpolateVector = interpolateVector;
const mixVector = (value, from, to) => {
  "worklet";

  return interpolateVector(value, [0, 1], [from, to]);
};
exports.mixVector = mixVector;
//# sourceMappingURL=interpolateVector.js.map