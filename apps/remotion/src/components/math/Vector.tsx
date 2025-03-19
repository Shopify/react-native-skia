import type { SkRect, Vector } from "@exodus/react-native-skia";
import { rect, vec } from "@exodus/react-native-skia";
import { interpolateColors } from "remotion";

export const { PI } = Math;
export const TAU = 2 * PI;

export const toDeg = (rad: number) => (rad * 180) / Math.PI;

export const toRad = (deg: number) => (deg * Math.PI) / 180;

export const clamp = (value: number, lowerBound: number, upperBound: number) =>
  Math.min(Math.max(lowerBound, value), upperBound);

export const saturate = (value: number) => clamp(value, 0, 1);

export const mixColors = (value: number, x: string, y: string) =>
  interpolateColors(value, [0, 1], [x, y]);

export const normalizeRad = (value: number) => {
  const rest = value % TAU;
  return rest > 0 ? rest : TAU + rest;
};

export const absoluteRadSub = (start: number, end: number) => {
  return start > end ? end + (TAU - start) : end - start;
};

export const rad2Minutes = (rad: number) => {
  return (24 * 60 * rad) / TAU;
};

export const approximates = (value: number, target: number, epsilon = 0.001) =>
  Math.abs(value - target) < epsilon;

export const getPointAtLength = (length: number, from: Vector, to: Vector) => {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const x = from.x + length * Math.cos(angle);
  const y = from.y + length * Math.sin(angle);
  return vec(x, y);
};

export const addBounds = (rects: SkRect[]) => {
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  const width = Math.max(...rects.map((r) => r.x + r.width));
  const height = Math.max(...rects.map((r) => r.y + r.height));
  return rect(x, y, width - x, height - y);
};
