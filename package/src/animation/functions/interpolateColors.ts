import { mix } from "../../renderer/processors/math";
import type { Color, SkColor } from "../../skia";
import { Skia } from "../../skia";

import { interpolate } from "./interpolate";

const interpolateColorsRGB = (
  value: number,
  inputRange: number[],
  outputRange: SkColor[]
) => {
  "worklet";
  const r = interpolate(
    value,
    inputRange,
    outputRange.map((c) => c[0]),
    "clamp"
  );
  const g = interpolate(
    value,
    inputRange,
    outputRange.map((c) => c[1]),
    "clamp"
  );
  const b = interpolate(
    value,
    inputRange,
    outputRange.map((c) => c[2]),
    "clamp"
  );
  const a = interpolate(
    value,
    inputRange,
    outputRange.map((c) => c[3]),
    "clamp"
  );
  // TODO: once Float32Array are supported in the reanimated integration we can switch there
  return [r, g, b, a];
};

export const interpolateColors = (
  value: number,
  inputRange: number[],
  _outputRange: Color[]
) => {
  "worklet";
  const outputRange = _outputRange.map((cl) => Skia.Color(cl));
  return interpolateColorsRGB(value, inputRange, outputRange);
};

export const mixColors = (value: number, x: Color, y: Color) => {
  "worklet";
  const c1 = Skia.Color(x);
  const c2 = Skia.Color(y);
  return new Float32Array([
    mix(value, c1[0], c2[0]),
    mix(value, c1[1], c2[1]),
    mix(value, c1[2], c2[2]),
    mix(value, c1[3], c2[3]),
  ]);
};
