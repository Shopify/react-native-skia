import { interpolate } from "../Animations/interpolate";

import { canvas2Polar, polar2Canvas } from "./Coordinates";
export interface Vector {
  x: number;
  y: number;
}

export const vec = (x = 0, y?: number) => ({ x, y: y ?? x });
export const neg = (a: Vector) => vec(-a.x, -a.y);
export const translate = ({ x, y }: Vector) =>
  [{ translateX: x }, { translateY: y }] as const;
export const rotate = (tr: Vector, origin: Vector, rotation: number) => {
  const { radius, theta } = canvas2Polar(tr, origin);
  return polar2Canvas({ radius, theta: theta + rotation }, origin);
};

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
