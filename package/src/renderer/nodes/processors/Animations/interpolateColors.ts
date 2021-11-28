import { Skia } from "../../../../skia";
import { red, blue, green, alpha, color } from "../Paint";

import { interpolate } from "./interpolate";

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const interpolateColorsRGB = (
  value: number,
  inputRange: number[],
  outputRange: number[]
) => {
  const r = interpolate(
    value,
    inputRange,
    outputRange.map((c) => red(c)),
    CLAMP
  );
  const g = interpolate(
    value,
    inputRange,
    outputRange.map((c) => green(c)),
    CLAMP
  );
  const b = interpolate(
    value,
    inputRange,
    outputRange.map((c) => blue(c)),
    CLAMP
  );
  const a = interpolate(
    value,
    inputRange,
    outputRange.map((c) => alpha(c)),
    CLAMP
  );
  return color(r, g, b, a);
};

export const interpolateColors = (
  value: number,
  inputRange: number[],
  _outputRange: string[]
) => {
  const outputRange = _outputRange.map((cl) => Skia.Color(cl));
  return interpolateColorsRGB(value, inputRange, outputRange);
};
