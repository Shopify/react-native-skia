import { mix } from "../../renderer";
import type { Color } from "../../skia";
import { Skia } from "../../skia";
import type { SkColor } from "../../skia/Color";

import { interpolate } from "./interpolate";

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const interpolateColorsRGB = (
  value: number,
  inputRange: number[],
  outputRange: SkColor[]
) => {
  const r = interpolate(
    value,
    inputRange,
    outputRange.map((c) => c[0]),
    CLAMP
  );
  const g = interpolate(
    value,
    inputRange,
    outputRange.map((c) => c[1]),
    CLAMP
  );
  const b = interpolate(
    value,
    inputRange,
    outputRange.map((c) => c[2]),
    CLAMP
  );
  const a = interpolate(
    value,
    inputRange,
    outputRange.map((c) => c[3]),
    CLAMP
  );
  return new Float32Array([r, g, b, a]);
};

export const interpolateColors = (
  value: number,
  inputRange: number[],
  _outputRange: Color[]
) => {
  const outputRange = _outputRange.map((cl) => Skia.Color(cl));
  return interpolateColorsRGB(value, inputRange, outputRange);
};

export const mixColors = (value: number, x: Color, y: Color) => {
  const c1 = Skia.Color(x);
  const c2 = Skia.Color(y);
  return new Float32Array([
    mix(value, c1[0], c2[0]),
    mix(value, c1[1], c2[1]),
    mix(value, c1[2], c2[2]),
    mix(value, c1[3], c2[3]),
  ]);
};
