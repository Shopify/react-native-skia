import { interpolate } from "./interpolate";
export const interpolateVector = (value, inputRange, outputRange, options) => {
  "worklet";

  return {
    x: interpolate(value, inputRange, outputRange.map(v => v.x), options),
    y: interpolate(value, inputRange, outputRange.map(v => v.y), options)
  };
};
export const mixVector = (value, from, to) => {
  "worklet";

  return interpolateVector(value, [0, 1], [from, to]);
};
//# sourceMappingURL=interpolateVector.js.map