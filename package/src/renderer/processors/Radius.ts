import type { Skia, Vector } from "../../skia/types";

export type Radius = number | Vector;

export const processRadius = (Skia: Skia, radius: Radius): Vector => {
  if (typeof radius === "number") {
    return Skia.Point(radius, radius);
  }
  return radius;
};
