import type { Vector } from "../../../skia/types";

import { canvas2Polar, polar2Canvas } from "./Coordinates";

export const rotate = (tr: Vector, origin: Vector, rotation: number) => {
  "worklet";
  const { radius, theta } = canvas2Polar(tr, origin);
  return polar2Canvas({ radius, theta: theta + rotation }, origin);
};
