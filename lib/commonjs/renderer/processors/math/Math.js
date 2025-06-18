"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.saturate = exports.mix = exports.clamp = void 0;
/**
 * Linear interpolation
 * @param value
 * @param x
 * @param y
 */
const mix = (value, x, y) => {
  "worklet";

  return x * (1 - value) + y * value;
};

/**
 *  @summary Clamps a node with a lower and upper bound.
 *  @example
    clamp(-1, 0, 100); // 0
    clamp(1, 0, 100); // 1
    clamp(101, 0, 100); // 100
  */
exports.mix = mix;
const clamp = (value, lowerBound, upperBound) => {
  "worklet";

  return Math.min(Math.max(lowerBound, value), upperBound);
};
exports.clamp = clamp;
const saturate = value => {
  "worklet";

  return clamp(value, 0, 1);
};
exports.saturate = saturate;
//# sourceMappingURL=Math.js.map