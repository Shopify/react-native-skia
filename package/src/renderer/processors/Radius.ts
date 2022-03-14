import type { Vector } from "./math";
import { vec } from "./math";

export type Radius = number | Vector;

export const processRadius = (radius: Radius): Vector => {
  if (typeof radius === "number") {
    return vec(radius, radius);
  }
  return radius;
};
