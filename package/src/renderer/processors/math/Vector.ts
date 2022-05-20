import { interpolate } from "../../../animation/functions/interpolate";
import { Skia } from "../../../skia";

export interface Vector {
  x: number;
  y: number;
}

export const vec = (x = 0, y?: number) => Skia.Point(x, y ?? x);
export const neg = (a: Vector) => vec(-a.x, -a.y);
export const add = (a: Vector, b: Vector) => vec(a.x + b.x, a.y + b.y);
export const sub = (a: Vector, b: Vector) => vec(a.x - b.x, a.y - b.y);
export const dist = (a: Vector, b: Vector) => Math.hypot(a.x - b.x, a.y - b.y);
export const translate = ({ x, y }: Vector) =>
  [{ translateX: x }, { translateY: y }] as const;

export const interpolateVector = (
  value: number,
  inputRange: readonly number[],
  outputRange: readonly Vector[],
  options?: Parameters<typeof interpolate>[3]
) => ({
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
});

export const mixVector = (value: number, from: Vector, to: Vector) =>
  interpolateVector(value, [0, 1], [from, to]);
