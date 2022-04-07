import { canvas2Polar, polar2Canvas } from "./Coordinates";
import type { Vector } from "./Vector";

export const rotate = (tr: Vector, origin: Vector, rotation: number) => {
  const { radius, theta } = canvas2Polar(tr, origin);
  return polar2Canvas({ radius, theta: theta + rotation }, origin);
};
