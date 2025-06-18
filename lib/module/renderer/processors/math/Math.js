/**
 * Linear interpolation
 * @param value
 * @param x
 * @param y
 */
export const mix = (value, x, y) => {
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
export const clamp = (value, lowerBound, upperBound) => {
  "worklet";

  return Math.min(Math.max(lowerBound, value), upperBound);
};
export const saturate = value => {
  "worklet";

  return clamp(value, 0, 1);
};
//# sourceMappingURL=Math.js.map