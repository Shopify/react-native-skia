import type { Vector } from "../../skia/types";

import { interpolate } from "./interpolate";

export const interpolateVector = (
  value: number,
  inputRange: readonly number[],
  outputRange: readonly Vector[],
  options?: Parameters<typeof interpolate>[3]
) => {
  "worklet";
  return {
    x: interpolate(
      value,
      inputRange,
      outputRange.map((v) => v.x),
      options
    ),
    y: interpolate(
      value,
      inputRange,
      outputRange.map((v) => v.y),
      options
    ),
  };
};

export const mixVector = (value: number, from: Vector, to: Vector) => {
  "worklet";
  return interpolateVector(value, [0, 1], [from, to]);
};
